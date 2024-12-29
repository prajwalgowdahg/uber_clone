import {
  Image,
  Alert,
  StyleSheet,
  Text,
  View,
  ViewComponent,
} from "react-native";
import React from "react";
import { icons, images } from "@/constants";
import { ScrollView } from "react-native";
import { InputField } from "@/components/InputField";
import { useState } from "react";
import CustomButton from "@/components/CustomButton";
import { Link } from "expo-router";
import OAuth from "@/components/Oauth";
import { useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import ReactNativeModal from "react-native-modal";
import { useAuth } from "@clerk/clerk-expo";
import { fetchAPI } from "@/lib/fetch";
const SignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { isSignedIn } = useAuth();

  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [verification, setVerification] = useState({
    state: "default",
    error: "",
    emailCode: "",
    phoneCode: "",
  });
  const [showSuccessModal, setShowSuccessModal] = useState(isSignedIn);
  const [showModal, setShowModal] = useState(isSignedIn);

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return;

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
        phoneNumber: form.phone,
      });
      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      await signUp.preparePhoneNumberVerification({ strategy: "phone_code" });

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setVerification({ ...verification, state: "pending" });
    } catch (err: any) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      Alert.alert("Error", err.errors[0].longMessage);
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: verification.emailCode,
      });
      const phoneVerificationAttempt =
        await signUp.attemptPhoneNumberVerification({
          code: verification.phoneCode,
        });
      console.log(
        signUpAttempt.status,
        "what is this ",
        phoneVerificationAttempt.status
      );
      // If verification was completed, set the session to active
      // and redirect the user
      //setShowModal(true);

      if (
        signUpAttempt.status === "complete" &&
        phoneVerificationAttempt.status === "complete"
      ) {
        console.log("I am inside");
        // create user in database here
        await fetchAPI("/(api)/user", {
          method: "POST",
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            clerkId: signUpAttempt.createdUserId,
          }),
        });
        setShowModal(true);
        console.log(showSuccessModal);
        setVerification({ ...verification, state: "success" });
        await setActive({ session: signUpAttempt.createdSessionId });
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        setVerification({
          ...verification,
          state: "failed",
          error: "verfication failed",
        });
        Alert.alert("Error", "User verification failed.");
        //console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err: any) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      setVerification({
        ...verification,
        state: "failed",
        error: err.errors[0].longMessage,
      });

      //console.error(JSON.stringify(err, null, 2));
      Alert.alert("Error", err.errors[0].longMessage);
    }
  };
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[250px] ">
          <Image source={images.signUpCar} className="z-0 w-full h-[250px]" />
          <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
            Create Your Account
          </Text>
        </View>
        <View className="p-5">
          <InputField
            label="Name"
            placeholder="Enter name"
            icon={icons.person}
            value={form.name}
            onChangeText={(value) => setForm({ ...form, name: value })}
          />
          <InputField
            label="Email"
            placeholder="Enter email"
            icon={icons.email}
            textContentType="emailAddress"
            value={form.email}
            onChangeText={(value) => setForm({ ...form, email: value })}
          />

          <InputField
            label={"Phone Number"}
            icon={icons.lock}
            placeholder={"64569879"}
            value={form.phone}
            keyboardType="numeric"
            onChangeText={(phoneNumber) =>
              setForm({ ...form, phone: phoneNumber })
            }
          />
          <InputField
            label="Password"
            placeholder="Enter password"
            icon={icons.lock}
            secureTextEntry={true}
            textContentType="password"
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
          />
          <CustomButton
            title="Sign Up"
            onPress={onSignUpPress}
            className="mt-6"
          />
          {/* Oauth */}
          <OAuth />

          <Link
            href="/signin"
            className="text-lg text-center text-general-200 mt-10"
          >
            <Text>Already have an Account? </Text>
            <Text className="text-primary-500">LogIn</Text>
          </Link>
        </View>
        {/* verification modal */}
        <ReactNativeModal
          isVisible={verification.state === "pending"}
          // onBackdropPress={() =>
          //   setVerification({ ...verification, state: "default" })
          // }
          onModalHide={() => {
            if (verification.state === "success") {
              setShowModal(true);
            }
          }}
        >
          <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
            <Text className="font-JakartaExtraBold text-2xl mb-2">
              Verification
            </Text>
            <Text className="font-Jakarta mb-5">
              We've sent a verification code to {form.email}.
            </Text>
            <InputField
              label={"Code"}
              icon={icons.lock}
              placeholder={"12345"}
              value={verification.emailCode}
              keyboardType="numeric"
              onChangeText={(code) =>
                setVerification({ ...verification, emailCode: code })
              }
            />
            {verification.error && (
              <Text className="text-red-500 text-sm mt-1">
                {verification.error}
              </Text>
            )}

            {/* phone verification */}
            <Text className="font-Jakarta mb-5">
              We've sent a verification code to {form.phone}.
            </Text>
            <InputField
              label={"Code"}
              icon={icons.lock}
              placeholder={"12345"}
              value={verification.phoneCode}
              keyboardType="numeric"
              onChangeText={(code) =>
                setVerification({ ...verification, phoneCode: code })
              }
            />
            {verification.error && (
              <Text className="text-red-500 text-sm mt-1">
                {verification.error}
              </Text>
            )}
            <CustomButton
              title="Verify"
              onPress={onVerifyPress}
              className="mt-5 bg-success-500"
            />
          </View>
        </ReactNativeModal>
        <ReactNativeModal isVisible={showModal === true}>
          <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
            <Image
              source={images.check}
              className="w-[110px] h-[110px] mx-auto my-5"
            />
            <Text className="text-3xl font-JakartaBold text-center">
              Verified
            </Text>
            <Text className="text-base text-gray-400 font-Jakarta text-center mt-2">
              You have successfully verified your account.
            </Text>
            <CustomButton
              title="Browse Home"
              onPress={() => {
                setShowModal(false);
                router.push(`/(root)/(tabs)/home`);
              }}
              className="mt-5"
            />
          </View>
        </ReactNativeModal>
      </View>
    </ScrollView>
  );
};

export default SignUp;

const styles = StyleSheet.create({});
