import {useEffect, useState} from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {
  StackActions,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import {AntDesign, MaterialIcons} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {login} from "../config/authentication";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();
  const isFocused = useIsFocused();

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("user");
      if (token) {
        navigation.dispatch(StackActions.replace("Main"));
      }
    };
    if (isFocused) {
      checkLogin();
    }
  }, [isFocused]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!email || !password) {
        setLoading(false);
        Alert.alert("Something Went Wrong!", "Please fill all the fields.");
      } else {
        const response = await login(email, password);
        await AsyncStorage.setItem("user", response.user.uid);
        Alert.alert("Success!", "Login Success!");
        setLoading(false);
        navigation.dispatch(StackActions.replace("Main"));
      }
    } catch (error) {
      Alert.alert("Something Went Wrong!", error.message);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading && <ActivityIndicator size="large" style={styles.loading} />}
      <KeyboardAvoidingView>
        <View style={styles.titleView}>
          <Text style={styles.title}>Login in to your account</Text>
        </View>
        <View style={styles.inputContainer}>
          <View style={styles.inputView}>
            <MaterialIcons
              style={styles.inputIcon}
              name="email"
              size={24}
              color="gray"
            />
            <TextInput
              value={email}
              onChangeText={(text) => setEmail(text)}
              style={styles.textInput}
              placeholder="enter your email"
            />
          </View>
        </View>
        <View style={styles.inputContainer}>
          <View style={styles.inputView}>
            <AntDesign
              name="lock1"
              size={24}
              color="gray"
              style={styles.inputIcon}
            />
            <TextInput
              value={password}
              onChangeText={(text) => setPassword(text)}
              secureTextEntry={true}
              style={styles.textInput}
              placeholder="enter your password"
            />
          </View>
        </View>
        <Pressable onPress={handleSubmit} style={styles.buttonContainer}>
          <Text style={styles.buttonText}>Login</Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate("Register")}
          style={styles.redirectContainer}
        >
          <Text style={styles.redirectText}>
            Don't have an account? Sign Up
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  loading: {
    position: "absolute",
    top: "40%",
    left: "40%",
    zIndex: 9999,
    backgroundColor: "gray",
    padding: 30,
  },
  titleView: {
    alignItems: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "bold",
    marginTop: 12,
    color: "#041E42",
  },
  inputContainer: {
    marginTop: 10,
  },
  inputView: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#D0D0D0",
    paddingVertical: 5,
    borderRadius: 5,
    marginTop: 30,
  },
  inputIcon: {
    marginLeft: 8,
  },
  textInput: {
    color: "black",
    marginVertical: 10,
    width: 300,
    fontSize: 16,
  },
  buttonContainer: {
    width: 200,
    backgroundColor: "#FEBE10",
    borderRadius: 6,
    marginLeft: "auto",
    marginRight: "auto",
    padding: 15,
    marginTop: 50,
  },
  buttonText: {
    textAlign: "center",
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  redirectContainer: {
    marginTop: 15,
  },
  redirectText: {
    textAlign: "center",
    color: "gray",
    fontSize: 16,
  },
});

export default LoginScreen;
