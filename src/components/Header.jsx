import {Alert, Button, StyleSheet, View, Text} from "react-native";
import {StackActions, useNavigation} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {logout} from "../config/authentication";

const Header = ({title}) => {
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await logout();
      await AsyncStorage.removeItem("user");
      navigation.dispatch(StackActions.replace("Login"));
      Alert.alert("Success!", "You are logged out.");
    } catch (error) {
      Alert.alert("Something Went Wrong!", error);
    }
  };

  return (
    <View style={styles.container}>
      <Button
        onPress={() => {
          navigation.dispatch(StackActions.push("Create"));
        }}
        title="Create Blog"
      />
      <Text style={styles.title}>{title}</Text>
      <Button onPress={handleLogout} title="Logout" />
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    height: 50,
    paddingHorizontal: 20,
    backgroundColor: "gray",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: "white",
    fontWeight: "bold",
  },
});
