import { KeyboardAvoidingView, Platform } from "react-native";

export const ModalAvoidKeyboardView = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
      }}
      pointerEvents="box-none"
    >
      {children}
    </KeyboardAvoidingView>
  );
};
