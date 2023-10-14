import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  StackActions,
  useNavigation,
  useIsFocused,
} from "@react-navigation/native";
import {Camera} from "expo-camera";
import {doc, getDoc, onSnapshot, updateDoc} from "firebase/firestore";
import {useEffect, useState} from "react";
import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  Image,
  Button,
  TextInput,
  Pressable,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {SafeAreaView} from "react-native-safe-area-context";
import {
  Entypo,
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";

import {db} from "../config/firebase";
import {uploadImage} from "../config/storage";

const ProfileScreen = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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
      if (!token) {
        navigation.dispatch(StackActions.replace("Login"));
      } else {
        setCurrentUser(token);
        onSnapshot(doc(db, "users", token), (doc) => {
          setName(doc.data().name);
          setEmail(doc.data().email);
          setGender(doc.data().gender);
          setAge(doc.data().age);
          setZip(doc.data().zip);
          setState(doc.data().state);
          setAddress(doc.data().address);
          setCountry(doc.data().country);
          setImage(doc.data().image);
        });
      }
    };
    if (isFocused) {
      checkLogin();
    }
  }, []);

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
        const userRef = doc(db, "users", currentUser);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
          setLoading(false);
          Alert.alert("Something Went Wrong!", "data not found.");
        }
        const newImageURL = await uploadImage(image);
        await updateDoc(userRef, {
          name,
          email,
          gender,
          age,
          zip,
          state,
          address,
          country,
          image: newImageURL,
        });
        Alert.alert("Success!", "Profile Update Success!");
        setLoading(false);
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
            <Text style={styles.title}>Manage profile</Text>
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
              <Text style={styles.textInput}>{email}</Text>
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
            <Text style={styles.buttonText}>Update</Text>
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
  image: {
    height: 200,
    width: 200,
    resizeMode: "cover",
    marginLeft: "auto",
    marginRight: "auto",
    marginBottom: 10,
    borderRadius: 99999,
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
});

export default ProfileScreen;
