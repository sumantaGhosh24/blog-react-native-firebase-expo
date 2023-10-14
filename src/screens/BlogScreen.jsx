import {MaterialIcons} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  StackActions,
  useNavigation,
  useRoute,
  useIsFocused,
} from "@react-navigation/native";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import {useEffect, useState} from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";

import SubHeader from "../components/SubHeader";
import {db} from "../config/firebase";

const BlogScreen = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [blog, setBlog] = useState();
  const [comments, setComments] = useState([]);
  const [commentTitle, setCommentTitle] = useState("");
  const [commentDescription, setCommentDescription] = useState("");

  const navigation = useNavigation();
  const route = useRoute();
  const isFocused = useIsFocused();

  const {id} = route.params;

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

      onSnapshot(doc(db, "blogs", id), (doc) => {
        setBlog({id: doc.id, ...doc.data()});
      });

      const q = query(collection(db, "comments"), where("blog", "==", id));
      onSnapshot(q, (querySnapshot) => {
        let list = [];
        querySnapshot.forEach(async (doc) => {
          list.push({id: doc.id, ...doc.data()});
        });
        setComments(list);
      });
    }
  }, [isFocused]);

  const createComment = async (e) => {
    e.preventDefault();
    try {
      if (!currentUser || !id || !commentTitle || !commentDescription) {
        Alert.alert("Something Went Wrong!", "Please fill all the fields.");
      } else {
        await addDoc(collection(db, "comments"), {
          user: currentUser,
          blog: id,
          title: commentTitle,
          description: commentDescription,
          timestamp: serverTimestamp(),
        });
        setCommentTitle("");
        setCommentDescription("");
        Alert.alert("Success!", "Comment Added!");
      }
    } catch (error) {
      Alert.alert("Something Went Wrong!", error.message);
    }
  };

  return (
    <SafeAreaView>
      <SubHeader title="Blog" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.titleView}>
          <Image source={{uri: blog?.image}} style={styles.image} />
          <Text style={styles.title}>{blog?.title}</Text>
          <Text style={styles.description}>{blog?.description}</Text>
          <Text style={styles.content}>{blog?.content}</Text>
          <Text style={styles.timestamp}>
            Timestamp: {blog?.timestamp?.toDate().toDateString()}
          </Text>
          <Text style={styles.user}>User: {blog?.user}</Text>
        </View>
        <View style={styles.commentContainer}>
          <KeyboardAvoidingView>
            <View style={styles.commentTitleView}>
              <Text style={styles.commentTitle}>Add you comment</Text>
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
                  value={commentTitle}
                  onChangeText={(text) => setCommentTitle(text)}
                  style={styles.textInput}
                  placeholder="enter comment title"
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
                  value={commentDescription}
                  onChangeText={(text) => setCommentDescription(text)}
                  style={styles.textInput}
                  placeholder="enter comment description"
                />
              </View>
            </View>
            <Pressable onPress={createComment} style={styles.buttonContainer}>
              <Text style={styles.buttonText}>Create Comment</Text>
            </Pressable>
          </KeyboardAvoidingView>
        </View>
        <View style={styles.viewGap}>
          {comments?.length < 1 ? (
            <Text style={styles.commentError}>
              This blog don't have any comment yet.
            </Text>
          ) : (
            comments?.map((data) => (
              <CommentItem
                title={data.title}
                description={data.description}
                timestamp={data.timestamp}
                user={data.user}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const CommentItem = ({title, description, timestamp, user}) => {
  const [commentUser, setCommentUser] = useState();

  useEffect(() => {
    const getUser = async () => {
      const userSnap = await getDoc(doc(db, "users", user));
      setCommentUser({id: userSnap.id, ...userSnap.data()});
    };
    return () => getUser();
  }, [user]);

  return (
    <View style={styles.commentViewContainer}>
      <View style={styles.commentView}>
        <Text style={styles.commentTitle}>{title}</Text>
        <Text style={styles.commentDescription}>{description}</Text>
        <Text style={styles.commentTimestamp}>
          {timestamp?.toDate().toDateString()}
        </Text>
      </View>
      <View style={styles.userView}>
        <Image source={{uri: commentUser?.image}} style={styles.userImage} />
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{commentUser?.name}</Text>
          <Text style={styles.userEmail}>{commentUser?.email}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    marginLeft: 10,
    marginRight: 10,
    marginTop: 25,
  },
  titleView: {
    marginBottom: 20,
  },
  image: {
    width: "full",
    height: 200,
    resizeMode: "cover",
    borderRadius: 10,
    marginBottom: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
    textTransform: "capitalize",
  },
  description: {
    fontSize: 20,
    fontWeight: "400",
    marginBottom: 10,
    color: "#1c1a1a",
    textTransform: "capitalize",
  },
  content: {
    fontSize: 18,
    fontWeight: "300",
    marginBottom: 10,
    color: "gray",
  },
  timestamp: {
    fontSize: 16,
    fontWeight: "300",
    marginBottom: 10,
    color: "gray",
  },
  user: {
    fontSize: 16,
    fontWeight: "300",
    color: "gray",
  },
  commentContainer: {
    marginBottom: 20,
    backgroundColor: "lightgray",
    padding: 10,
    borderRadius: 15,
  },
  commentTitleView: {
    textAlign: "center",
  },
  commentTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  inputContainer: {
    marginTop: 5,
  },
  inputView: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#ffffff",
    paddingVertical: 5,
    borderRadius: 5,
    marginTop: 10,
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
    marginTop: 15,
  },
  buttonText: {
    textAlign: "center",
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  commentError: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  viewGap: {
    marginBottom: 50,
  },
  commentViewContainer: {
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: "lightgray",
    padding: 10,
    borderRadius: 15,
  },
  commentView: {
    marginBottom: 10,
  },
  commentTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textTransform: "capitalize",
  },
  commentDescription: {
    fontSize: 18,
    fontWeight: "400",
    marginBottom: 10,
  },
  commentTimestamp: {
    fontSize: 16,
    fontWeight: "300",
    marginBottom: 10,
  },
  userView: {
    display: "flex",
    flexDirection: "row",
  },
  userImage: {
    height: 100,
    width: 100,
    borderRadius: 9999,
    resizeMode: "cover",
  },
  userDetails: {
    marginLeft: 25,
    justifyContent: "center",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    textTransform: "capitalize",
  },
  userEmail: {
    fontSize: 16,
    fontWeight: "400",
    color: "gray",
  },
});

export default BlogScreen;
