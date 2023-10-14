import {useEffect, useState} from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  TextInput,
  Image,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Button,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {Camera} from "expo-camera";
import {
  StackActions,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {doc, serverTimestamp, setDoc} from "firebase/firestore";
import {
  AntDesign,
  Entypo,
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";

import {uploadImage} from "../config/storage";
import {register} from "../config/authentication";
import {db} from "../config/firebase";

const RegisterScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [zip, setZip] = useState("");
  const [state, setState] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  let camera;

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

  useEffect(() => {
    (async () => {
      const {status} = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(status === "granted");
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result?.assets[0]?.uri);
    }
  };

  const takePicture = async () => {
    if (cameraPermission) {
      const {uri} = await camera.takePictureAsync();
      setImage(uri);
      setIsCameraVisible(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (
        !name ||
        !email ||
        !password ||
        !gender ||
        !age ||
        !zip ||
        !state ||
        !address ||
        !country ||
        !image
      ) {
        setLoading(false);
        Alert.alert("Something Went Wrong!", "Please fill all the fields.");
      } else {
        const res = await register(email, password);
        const imageUrl = await uploadImage(image);
        const obj = {
          name,
          email,
          gender,
          age,
          zip,
          state,
          address,
          country,
          image: imageUrl,
        };
        await setDoc(doc(db, "users", res.user.uid), {
          ...obj,
          timestamp: serverTimestamp(),
        });
        await AsyncStorage.setItem("user", res.user.uid);
        Alert.alert("Success!", "Register Success!");
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
      <ScrollView style={styles.scrollView}>
        <KeyboardAvoidingView>
          <View style={styles.titleView}>
            <Text style={styles.title}>Register new account</Text>
          </View>
          <View style={styles.inputContainer}>
            <TouchableOpacity onPress={pickImage}>
              {image ? (
                <Image source={{uri: image}} style={styles.image} />
              ) : (
                <Text>Upload Image</Text>
              )}
            </TouchableOpacity>
            {isCameraVisible ? (
              <View>
                <Camera
                  style={styles.cameraCon}
                  type={cameraType}
                  ref={(ref) => {
                    camera = ref;
                  }}
                >
                  <View style={styles.cameraContainer}>
                    <Button title="Take a Picture" onPress={takePicture} />
                    <Button
                      title="Switch Camera"
                      onPress={() => {
                        setCameraType(
                          cameraType === Camera.Constants.Type.back
                            ? Camera.Constants.Type.front
                            : Camera.Constants.Type.back
                        );
                      }}
                    />
                    <Button
                      title="Cancel"
                      onPress={() => setIsCameraVisible(false)}
                    />
                  </View>
                </Camera>
              </View>
            ) : (
              <Button
                title="Take a Picture"
                onPress={() => setIsCameraVisible(true)}
              />
            )}
          </View>
          <View style={styles.inputContainer}>
            <View style={styles.inputView}>
              <MaterialIcons
                name="person"
                size={24}
                color="gray"
                style={styles.inputIcon}
              />
              <TextInput
                value={name}
                onChangeText={(text) => setName(text)}
                style={styles.textInput}
                placeholder="enter your name"
              />
            </View>
          </View>
          <View style={styles.inputContainer}>
            <View style={styles.inputView}>
              <MaterialIcons
                name="email"
                size={24}
                color="gray"
                style={styles.inputIcon}
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
                style={styles.textInput}
                placeholder="enter your password"
                secureTextEntry
              />
            </View>
          </View>
          <View style={styles.inputContainer}>
            <View style={styles.inputView}>
              <Ionicons
                name="person"
                size={24}
                color="gray"
                style={styles.inputIcon}
              />
              <TextInput
                value={gender}
                onChangeText={(text) => setGender(text)}
                style={styles.textInput}
                placeholder="enter your gender"
              />
            </View>
          </View>
          <View style={styles.inputContainer}>
            <View style={styles.inputView}>
              <FontAwesome5
                name="person-booth"
                size={24}
                color="gray"
                style={styles.inputIcon}
              />
              <TextInput
                value={age}
                onChangeText={(text) => setAge(text)}
                style={styles.textInput}
                placeholder="enter your age"
              />
            </View>
          </View>
          <View style={styles.inputContainer}>
            <View style={styles.inputView}>
              <Feather
                name="flag"
                size={24}
                color="gray"
                style={styles.inputIcon}
              />
              <TextInput
                value={country}
                onChangeText={(text) => setCountry(text)}
                style={styles.textInput}
                placeholder="enter your country"
              />
            </View>
          </View>
          <View style={styles.inputContainer}>
            <View style={styles.inputView}>
              <Entypo
                name="flag"
                size={24}
                color="gray"
                style={styles.inputIcon}
              />
              <TextInput
                value={state}
                onChangeText={(text) => setState(text)}
                style={styles.textInput}
                placeholder="enter your state"
              />
            </View>
          </View>
          <View style={styles.inputContainer}>
            <View style={styles.inputView}>
              <Entypo
                name="pin"
                size={24}
                color="gray"
                style={styles.inputIcon}
              />
              <TextInput
                value={zip}
                onChangeText={(text) => setZip(text)}
                style={styles.textInput}
                placeholder="enter your zip"
              />
            </View>
          </View>
          <View style={styles.inputContainer}>
            <View style={styles.inputView}>
              <Entypo
                name="address"
                size={24}
                color="gray"
                style={styles.inputIcon}
              />
              <TextInput
                value={address}
                onChangeText={(text) => setAddress(text)}
                style={styles.textInput}
                placeholder="enter your address"
              />
            </View>
          </View>
          <Pressable onPress={handleSubmit} style={styles.buttonContainer}>
            <Text style={styles.buttonText}>Register</Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate("Login")}
            style={styles.redirectContainer}
          >
            <Text style={styles.redirectText}>
              Already have an account? Sign In
            </Text>
          </Pressable>
        </KeyboardAvoidingView>
      </ScrollView>
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
  scrollView: {
    marginTop: 50,
    marginBottom: 50,
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
  cameraCon: {
    flex: 1,
    minHeight: 500,
  },
  cameraContainer: {
    backgroundColor: "transparent",
    flexDirection: "row",
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
  image: {
    width: 200,
    height: 200,
  },
});

export default RegisterScreen;
