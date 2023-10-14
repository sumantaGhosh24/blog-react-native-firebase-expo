import {Alert, Button, StyleSheet, View, Text} from "react-native";
import {StackActions, useNavigation} from "@react-navigation/native";

import {logout} from "../config/authentication";

const SubHeader = ({title}) => {
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await logout();
      navigation.dispatch(StackActions.replace("Login"));
      Alert.alert("Success!", "You are logged out.");
    } catch (error) {
      Alert.alert("Something Went Wrong!", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Button
        onPress={() => {
          navigation.navigate("Home");
        }}
        title="Home"
      />
      <Text style={styles.title}>{title}</Text>
      <Button onPress={handleLogout} title="Logout" />
    </View>
  );
};

export default SubHeader;

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
