import {AntDesign} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  StackActions,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import {collection, query, orderBy, onSnapshot} from "firebase/firestore";
import {useEffect, useState} from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";

import Header from "../components/Header";
import {db} from "../config/firebase";

const HomeScreen = () => {
  const [blogs, setBlogs] = useState();

  const navigation = useNavigation();
  const isFocused = useIsFocused();

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("user");
      if (!token) {
        navigation.dispatch(StackActions.replace("Login"));
      }
    };
    if (isFocused) {
      checkLogin();

      const q = query(collection(db, "blogs"), orderBy("timestamp"));
      onSnapshot(q, (querySnapshot) => {
        let list = [];
        querySnapshot.forEach((doc) => {
          list.push({id: doc.id, ...doc.data()});
        });
        setBlogs(list);
      });
    }
  }, [isFocused]);

  return (
    <SafeAreaView>
      <Header title={"Home"} />
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
});

export default HomeScreen;
