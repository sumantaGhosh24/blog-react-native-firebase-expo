import {AntDesign, Entypo, FontAwesome, Ionicons} from "@expo/vector-icons";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";

import BlogScreen from "../screens/BlogScreen";
import CreateBlogScreen from "../screens/CreateBlogScreen";
import DashboardScreen from "../screens/DashboardScreen";
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import MyCommentScreen from "../screens/MyCommentScreen";
import ProfileScreen from "../screens/ProfileScreen";
import RegisterScreen from "../screens/RegisterScreen";
import UpdateBlogScreen from "../screens/UpdateBlogScreen";

const StackNavigator = () => {
  const Stack = createNativeStackNavigator();
  const Tab = createBottomTabNavigator();

  function BottomTabs() {
    return (
      <Tab.Navigator>
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: "Home",
            tabBarLabelStyle: {color: "#000000"},
            headerShown: false,
            tabBarIcon: ({focused}) =>
              focused ? (
                <Entypo name="home" size={24} color="black" />
              ) : (
                <AntDesign name="home" size={24} color="black" />
              ),
          }}
        />
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            tabBarLabel: "Dashboard",
            tabBarLabelStyle: {color: "#000000"},
            headerShown: false,
            tabBarIcon: ({focused}) =>
              focused ? (
                <FontAwesome name="dashboard" size={24} color="black" />
              ) : (
                <AntDesign name="dashboard" size={24} color="black" />
              ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarLabel: "Profile",
            tabBarLabelStyle: {color: "#000000"},
            headerShown: false,
            tabBarIcon: ({focused}) =>
              focused ? (
                <Ionicons name="person" size={24} color="black" />
              ) : (
                <Ionicons name="person-outline" size={24} color="black" />
              ),
          }}
        />
        <Tab.Screen
          name="MyComment"
          component={MyCommentScreen}
          options={{
            tabBarLabel: "My Comment",
            tabBarLabelStyle: {color: "#000000"},
            headerShown: false,
            tabBarIcon: ({focused}) =>
              focused ? (
                <FontAwesome name="commenting" size={24} color="black" />
              ) : (
                <FontAwesome name="commenting-o" size={24} color="black" />
              ),
          }}
        />
      </Tab.Navigator>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Create"
          component={CreateBlogScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="UpdateBlog"
          component={UpdateBlogScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Blog"
          component={BlogScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Main"
          component={BottomTabs}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNavigator;
