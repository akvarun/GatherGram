import React, { useState } from "react";
import { View, Image, StyleSheet, ScrollView, Alert } from "react-native";
import Logo from "./Gather.png";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import { useNavigation } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import { useSignInEmailPassword } from "@nhost/react";

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

const SignInScreen = () => {
  const navigation = useNavigation();

  const { control, handleSubmit } = useForm();

  const { signInEmailPassword, isLoading } = useSignInEmailPassword();

  const onSignInPressed = async (data) => {
    if (isLoading) {
      return;
    }
    const { email, password } = data;
    const { error, needsEmailVerification } = await signInEmailPassword(
      email,
      password
    );

    if (error) {
      Alert.alert("Oops", error.message);
    }

    if (needsEmailVerification) {
      Alert.alert("Verify your email", "Check your email and follow the link");
    }
  };

  const onForgotPasswordPressed = () => {
    // navigation.navigate("ForgotPassword");
  };

  const onSignUpPress = () => {
    navigation.navigate("SignUp");
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Image source={Logo} style={styles.logo} resizeMode="cover" />

      <CustomInput
        name="email"
        placeholder="Email"
        control={control}
        rules={{
          required: "Email is required",
          pattern: { value: EMAIL_REGEX, message: "Email is invalid" },
        }}
      />

      <CustomInput
        name="password"
        placeholder="Password"
        secureTextEntry
        control={control}
        rules={{
          required: "Password is required",
          minLength: {
            value: 3,
            message: "Password should be minimum 3 characters long",
          },
        }}
      />

      <CustomButton
        text={isLoading ? "Loading..." : "Sign In"}
        onPress={handleSubmit(onSignInPressed)}
      />

      <CustomButton
        text="Forgot password?"
        onPress={onForgotPasswordPressed}
        type="TERTIARY"
      />

      <CustomButton
        text="Don't have an account? Create one"
        onPress={onSignUpPress}
        type="TERTIARY"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
  },
  logo: {
    width: "100%",
    height: undefined,
    aspectRatio: 16 / 9,
    marginBottom: 20,
  },
});

export default SignInScreen;
