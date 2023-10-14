import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  StackActions,
  useNavigation,
  useIsFocused,
} from "@react-navigation/native";
import {Camera} from "expo-camera";
import {addDoc, collection, serverTimestamp} from "firebase/firestore";
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
import {MaterialIcons} from "@expo/vector-icons";

import {db} from "../config/firebase";
import {uploadImage} from "../config/storage";
import SubHeader from "../components/SubHeader";

const CreateBlogScreen = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
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
      }
      setCurrentUser(token);
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
      if (!title || !description || !content || !image) {
        setLoading(false);
        Alert.alert("Something Went Wrong!", "Please fill all the fields.");
      } else {
        const imageUrl = await uploadImage(image);
        await addDoc(collection(db, "blogs"), {
          title,
          description,
          content,
          image: imageUrl,
          user: currentUser,
          timestamp: serverTimestamp(),
        });
        Alert.alert("Successful!", "Create Blog!");
        setLoading(false);
        navigation.navigate("Dashboard");
      }
    } catch (error) {
      Alert.alert("Something Went Wrong!", error.message);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView>
      <SubHeader title={"Create Blog"} />
      {loading && <ActivityIndicator size="large" style={styles.loading} />}
      <ScrollView style={styles.scrollView}>
        <KeyboardAvoidingView>
          <View style={styles.titleView}>
            <Text style={styles.title}>Create Blog</Text>
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
                name="title"
                size={24}
                color="gray"
                style={styles.inputIcon}
              />
              <TextInput
                value={title}
                onChangeText={(text) => setTitle(text)}
                style={styles.textInput}
                placeholder="enter your title"
              />
            </View>
          </View>
          <View style={styles.inputContainer}>
            <View style={styles.inputView}>
              <MaterialIcons
                name="description"
                size={24}
                color="gray"
                style={styles.inputIcon}
              />
              <TextInput
                value={description}
                onChangeText={(text) => setDescription(text)}
                style={styles.textInput}
                placeholder="enter your description"
                multiline={true}
                numberOfLines={3}
              />
            </View>
          </View>
          <View style={styles.inputContainer}>
            <View style={styles.inputView}>
              <MaterialIcons
                name="content-paste"
                size={24}
                color="gray"
                style={styles.inputIcon}
              />
              <TextInput
                value={content}
                onChangeText={(text) => setContent(text)}
                style={styles.textInput}
                placeholder="enter your content"
                multiline={true}
                numberOfLines={5}
              />
            </View>
          </View>
          <Pressable onPress={handleSubmit} style={styles.buttonContainer}>
            <Text style={styles.buttonText}>Create Blog</Text>
          </Pressable>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loading: {
    position: "absolute",
    top: "40%",
    left: "40%",
    zIndex: 9999,
    backgroundColor: "gray",
    padding: 30,
  },
  scrollView: {
    marginLeft: 10,
    marginRight: 10,
    marginTop: 25,
    marginBottom: 100,
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
  image: {
    height: 200,
    width: 200,
    resizeMode: "cover",
    borderRadius: 99999,
    marginLeft: "auto",
    marginRight: "auto",
    marginBottom: 10,
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
    textAlignVertical: "top",
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

export default CreateBlogScreen;
