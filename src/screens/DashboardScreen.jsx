import {AntDesign, Feather, MaterialIcons} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  StackActions,
  useNavigation,
  useIsFocused,
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
import {deleteObject, ref} from "firebase/storage";
import {useEffect, useState} from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";

import Header from "../components/Header";
import {db, storage} from "../config/firebase";

const DashboardScreen = () => {
  const [blogs, setBlogs] = useState();

  const navigation = useNavigation();
  const isFocused = useIsFocused();

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("user");
      if (!token) {
        navigation.dispatch(StackActions.replace("Login"));
      } else {
        const q = query(collection(db, "blogs"), where("user", "==", token));
        onSnapshot(q, (querySnapshot) => {
          let list = [];
          querySnapshot.forEach((doc) => {
            list.push({id: doc.id, ...doc.data()});
          });
          setBlogs(list);
        });
      }
    };
    if (isFocused) {
      checkLogin();
    }
  }, [isFocused]);

  return (
    <SafeAreaView>
      <Header title={"Dashboard"} />
      <ScrollView>
        {!blogs?.length && <Text style={styles.notFound}>No blog found.</Text>}
        {blogs?.map((data) => (
          <BlogItem
            key={data.id}
            id={data.id}
            title={data.title}
            description={data.description}
            image={data.image}
            timestamp={data.timestamp}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};
const BlogItem = ({id, title, description, image, timestamp}) => {
  const navigation = useNavigation();

  const handleView = () => {
    navigation.navigate("Blog", {
      id: id,
    });
  };

  const handleUpdate = () => {
    navigation.navigate("UpdateBlog", {
      id: id,
    });
  };

  const handleDelete = async (id) => {
    try {
      const blogRef = doc(db, "blogs", id);
      const blogDoc = await getDoc(blogRef);
      if (blogDoc.exists()) {
        await deleteDoc(blogRef);
        const imageURL = blogDoc.data().image;
        if (imageURL) {
          const imageRef = ref(storage, imageURL);
          await deleteObject(imageRef);
        }
      }
      Alert.alert("Successful!", "Blog delete successful!");
    } catch (error) {
      Alert.alert("Something Went Wrong!", error.message);
    }
  };

  return (
    <View style={styles.blogContainer}>
      <View style={styles.blogView}>
        <Image
          source={{uri: image}}
          style={styles.blogImage}
          alt={title}
          fadeDuration={3000}
        />
        <View style={styles.blogContent}>
          <Text style={styles.blogTitle}>{title}</Text>
          <Text style={styles.blogDescription}>{description}</Text>
        </View>
      </View>
      <View style={styles.divider} />
      <Text style={styles.info}>
        Timestamp: {timestamp?.toDate().toDateString()}
      </Text>
      <View style={styles.divider} />
      <View style={styles.blogActions}>
        <Pressable onPress={() => handleView()} style={styles.view}>
          <AntDesign name="eye" size={24} color="white" />
        </Pressable>
        <Pressable onPress={() => handleUpdate()} style={styles.update}>
          <Feather name="pen-tool" size={24} color="white" />
        </Pressable>
        <Pressable onPress={() => handleDelete(id)} style={styles.delete}>
          <MaterialIcons name="delete" size={24} color="white" />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  notFound: {
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 25,
    fontSize: 20,
    fontWeight: "bold",
  },
  blogContainer: {
    width: "95%",
    marginLeft: "auto",
    marginRight: "auto",
    marginVertical: 10,
    padding: 10,
    backgroundColor: "lightgray",
    borderRadius: 20,
  },
  blogView: {
    display: "flex",
    flexDirection: "row",
  },
  blogImage: {
    height: 50,
    width: 50,
    resizeMode: "cover",
    borderRadius: 999,
  },
  blogContent: {
    marginLeft: 15,
  },
  blogTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textTransform: "capitalize",
  },
  blogDescription: {
    fontSize: 16,
    fontWeight: "400",
    color: "gray",
    width: 250,
  },
  divider: {
    height: 5,
    width: "auto",
    backgroundColor: "black",
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 10,
  },
  info: {
    fontSize: 14,
    fontWeight: "300",
    color: "gray",
  },
  blogActions: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  view: {
    height: 35,
    width: 35,
    borderRadius: 9999,
    backgroundColor: "blue",
    justifyContent: "center",
    alignItems: "center",
  },
  update: {
    height: 35,
    width: 35,
    borderRadius: 9999,
    backgroundColor: "green",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    marginRight: 10,
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

export default DashboardScreen;
