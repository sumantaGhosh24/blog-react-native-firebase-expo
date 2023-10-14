import {MaterialIcons} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useNavigation,
  useIsFocused,
  StackActions,
} from "@react-navigation/native";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import {useEffect, useState} from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";

import Header from "../components/Header";
import {db} from "../config/firebase";

const MyCommentScreen = () => {
  const [comments, setComments] = useState();

  const navigation = useNavigation();
  const isFocused = useIsFocused();

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("user");
      if (!token) {
        navigation.dispatch(StackActions.replace("Login"));
      } else {
        const q = query(collection(db, "comments"), where("user", "==", token));
        onSnapshot(q, (querySnapshot) => {
          let list = [];
          querySnapshot.forEach((doc) => {
            list.push({id: doc.id, ...doc.data()});
          });
          setComments(list);
        });
      }
    };
    if (isFocused) {
      checkLogin();
    }
  }, [isFocused]);

  return (
    <SafeAreaView>
      <Header title={"My Comments"} />
      <ScrollView>
        {!comments?.length && (
          <Text style={styles.notfound}>No comment found.</Text>
        )}
        {comments?.map((data) => (
          <CommentItem
            key={data.id}
            id={data.id}
            title={data.title}
            description={data.description}
            timestamp={data.timestamp}
            user={data.user}
            blog={data.blog}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const CommentItem = ({id, title, description, timestamp, blog}) => {
  const handleDelete = async () => {
    try {
      const commentRef = doc(db, "comments", id);
      const commentDoc = await getDoc(commentRef);
      if (commentDoc.exists()) {
        await deleteDoc(commentRef);
      }
      Alert.alert("Successful!", "Comment delete successful!");
    } catch (error) {
      Alert.alert("Something Went Wrong!", error.message);
    }
  };

  return (
    <View style={styles.commentContainer}>
      <View>
        <Text style={styles.commentTitle}>{title}</Text>
        <Text style={styles.commentDescription}>{description}</Text>
        <Text style={styles.commentTimestamp}>
          {timestamp?.toDate().toDateString()}
        </Text>
      </View>
      <View style={styles.divider} />
      <Text style={styles.blogId}>Blog: {blog}</Text>
      <View style={styles.divider} />
      <View style={styles.commentAction}>
        <Pressable onPress={() => handleDelete()} style={styles.delete}>
          <MaterialIcons name="delete" size={24} color="white" />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  notfound: {
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 25,
    fontSize: 20,
    fontWeight: "bold",
  },
  commentContainer: {
    width: "95%",
    marginLeft: "auto",
    marginRight: "auto",
    marginVertical: 10,
    padding: 10,
    backgroundColor: "lightgray",
    borderRadius: 20,
  },
  commentTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textTransform: "capitalize",
  },
  commentDescription: {
    fontSize: 16,
    fontWeight: "400",
    color: "gray",
    width: 250,
  },
  commentTimestamp: {
    fontSize: 14,
    fontWeight: "300",
    color: "gray",
  },
  divider: {
    height: 5,
    width: "auto",
    backgroundColor: "black",
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 10,
  },
  blogId: {
    fontSize: 14,
    fontWeight: "300",
    color: "gray",
  },
  commentAction: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  delete: {
    height: 35,
    width: 35,
    borderRadius: 9999,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MyCommentScreen;
