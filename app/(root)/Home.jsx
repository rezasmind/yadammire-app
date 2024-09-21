import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  FlatList,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import DatePicker from "react-native-modern-datepicker";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { MonthCalendar } from "react-native-jalali-calendars";
import moment from "moment-jalaali";
import Toast from "react-native-toast-message";

import bgimg from "../../assets/images/topbarimg.png";

// Initialize Supabase client
const supabase = createClient(
  "https://zrvcptwbjgqleutuzexc.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpydmNwdHdiamdxbGV1dHV6ZXhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTgxODI3MDEsImV4cCI6MjAzMzc1ODcwMX0.NMqQMZt0wZkVeVk8zuxpn7NxNaDcLiRLf_7NtvgGgow"
);

const HomePage = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [taskNameEntered, setTaskNameEntered] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const [maxHeaderHeight, setMaxHeaderHeight] = useState(0);
  const [minHeaderHeight, setMinHeaderHeight] = useState(0);

  const [tasks, setTasks] = useState([]);

  const [taskTitle, setTaskTitle] = useState("");
  const [selectedHour, setSelectedHour] = useState("");
  const [selectedMinute, setSelectedMinute] = useState("");
  const [selectedDateType, setSelectedDateType] = useState(""); // "today", "tomorrow", or "custom"

  const [errors, setErrors] = useState({});

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const { height } = Dimensions.get("window");
    setMaxHeaderHeight(height * 0.25); // 25% of screen height
    setMinHeaderHeight(height * 0.18); // 18% of screen height

    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const userSession = await AsyncStorage.getItem("userSession");
      if (userSession) {
        let { phoneNumber } = JSON.parse(userSession);
        phoneNumber = phoneNumber.replace(/\D/g, "");
        if (phoneNumber.charAt(0) === "0") {
          phoneNumber = phoneNumber.substring(1);
        }

        const today = new Date().toISOString().split("T")[0];
        // Get today's date in YYYY-MM-DD format
        const { data, error } = await supabase
          .from("Tasks")
          .select("*")
          .eq("phone", phoneNumber)
          .gte("date", today)
          .lt("date", moment(today).add(1, "days").format("YYYY-MM-DD")); // Filter tasks for today's date

        if (error) throw error;

        setTasks(data);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleDateChange = (day) => {
    setSelectedDate(day);
    setCalendarVisible(false);
  };

  const handleCreateTask = async () => {
    const newErrors = {};
    if (!taskTitle.trim()) newErrors.taskTitle = "عنوان تسک الزامی است";
    if (!selectedDifficulty) newErrors.difficulty = "درجه سختی الزامی است";
    if (!selectedDateType) newErrors.dateType = "نوع تاریخ الزامی است";
    if (!selectedHour) newErrors.hour = "ساعت الزامی است";
    if (!selectedMinute) newErrors.minute = "دقیقه الزامی است";
    if (selectedDateType === "custom" && !selectedDate)
      newErrors.customDate = "تاریخ الزامی است";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      Alert.alert("خطا", "لطفا تمام فیلدهای الزامی را پر کنید");
      return;
    }

    try {
      const userSession = await AsyncStorage.getItem("userSession");
      if (userSession) {
        let { phoneNumber } = JSON.parse(userSession);
        phoneNumber = phoneNumber.replace(/\D/g, "");
        if (phoneNumber.charAt(0) === "0") {
          phoneNumber = phoneNumber.substring(1);
        }

        let taskDate;
        if (selectedDateType === "today") {
          taskDate = moment().format("YYYY-MM-DD");
        } else if (selectedDateType === "tomorrow") {
          taskDate = moment().add(1, "days").format("YYYY-MM-DD");
        } else if (selectedDateType === "custom") {
          taskDate = moment(selectedDate, "jYYYY/jMM/jDD").format("YYYY-MM-DD");
        }

        const reminderType = { S: 0, M: 1, L: 2, XL: 3 }[selectedDifficulty];

        // Ensure hours and minutes are two digits and handle negative values
        const hours = Math.max(0, (selectedHour - 3 + 24) % 24);
        const minutes = Math.max(0, (selectedMinute - 30 + 60) % 60);
        const formattedHours = hours.toString().padStart(2, "0");
        const formattedMinutes = minutes.toString().padStart(2, "0");
        const taskDateTime = `${taskDate} ${formattedHours}:${formattedMinutes}:00+00`;

        const { data, error } = await supabase.from("Tasks").insert([
          {
            phone: phoneNumber,
            title: taskTitle,
            date: taskDateTime,
            reminder_type: reminderType,
            status: false,
          },
        ]);

        if (error) throw error;

        // Import Toast from react-native-toast-message at the top of your file

        // Show a toast notification instead of an alert
        Alert.alert(
          "موفقیت",
          `تسک با موفقیت ایجاد شد\n\nعنوان: ${taskTitle}\nتاریخ: ${taskDate}\nزمان: ${hours}:${minutes}`,
          [
            {
              text: "تایید",
              onPress: () => {
                setModalVisible(false);
                fetchTasks();
              },
            },
          ]
        );
        setModalVisible(false);
        fetchTasks(); // Refresh the task list
      }
    } catch (error) {
      console.error("Error creating task:", error);
      Alert.alert("خطا", "مشکلی در ایجاد تسک پیش آمد. لطفا دوباره تلاش کنید");
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTasks().then(() => setRefreshing(false));
  }, []);

  return (
    <View className="flex-1">
      <Animated.View
        style={{
          height: scrollY.interpolate({
            inputRange: [0, 50],
            outputRange: [maxHeaderHeight, minHeaderHeight],
            extrapolate: "clamp",
          }),
          backgroundColor: "#18181b", // zinc-900
          justifyContent: "flex-end",
          alignItems: "center",
          transition: "height 0.3s ease-in-out",
        }}
      >
        <Image
          source={bgimg}
          style={{
            position: "absolute",
            width: "105%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <View className="flex flex-col p-5 justify-center items-center">
          <Text className="text-white font-PeydaBlack text-2xl z-10 shadow-md shadow-black">
            تسک های امروز
          </Text>
          <Text
            style={{ fontFamily: "PeydaSemiBold" }}
            className="text-white font-PeydaSemiBold text-lg shadow-md shadow-black"
          >
            {new Date().toLocaleDateString("fa-IR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>
      </Animated.View>

      <View className=" relative w-full h-full bg-zinc-900">
        <Animated.ScrollView
          className="flex-1 bg-zinc-900"
          contentContainerStyle={{
            justifyContent: "center",
            alignItems: "center",
          }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["white"]} // Color of the refresh indicator
              tintColor="white" // Color of the refresh indicator (iOS)
              title="در حال رفرش کردن..." // Text shown under the refresh indicator (iOS)
              titleColor="white"
              // Color of the text (iOS)
              className="font-PeydaRegular"
            />
          }
        >
          <View className="relative w-full flex flex-col mt-6 z-[99] items-center h-full">
            <FlatList
              className="w-full"
              data={tasks}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`w-11/12 mx-auto my-2 flex-row justify-between ${
                    item.status ? "bg-gray-600/50" : "bg-blue-800/50"
                  } rounded-xl p-4`}
                  disabled={item.status}
                >
                  <View className="flex-row items-center justify-center">
                    <TouchableOpacity className="mr-2" disabled={item.status}>
                      <Ionicons
                        name={item.status ? "checkbox" : "square-outline"}
                        size={24}
                        color={item.status ? "#808080" : "#2563eb"}
                      />
                    </TouchableOpacity>
                    <Text
                      className={`${
                        item.status ? "text-gray-400" : "text-white"
                      } font-PeydaBlack text-lg`}
                    >
                      {item.title}
                    </Text>
                  </View>

                  <View className="flex-row justify-center items-center">
                    <Text
                      className={`${
                        item.status ? "text-gray-400/50" : "text-white/50"
                      } font-PeydaSemiBold`}
                    >
                      {item.date
                        ? new Date(item.date).toLocaleString("fa-IR", {
                            timeZone: "Asia/Tehran",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })
                        : ""}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>

          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
              <View className="flex-1 justify-end">
                <View className="bg-black shadow- shadow-black rounded-t-3xl p-6">
                  <View className="flex-row justify-between items-center mb-6">
                    <TouchableOpacity
                      onPress={() => setModalVisible(false)}
                      className="p-2"
                    >
                      <Ionicons name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-PeydaBlack">
                      ایجاد تسک جدید
                    </Text>
                    <TouchableOpacity
                      onPress={handleCreateTask}
                      className="bg-blue-500 px-4 py-2 rounded-lg"
                    >
                      <Text className="font-PeydaSemiBold text-white">
                        ساخت
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView className="max-h-[80%]">
                    <TextInput
                      className={`bg-zinc-800 text-white p-4 text-lg font-PeydaRegular text-right mb-4 rounded-lg ${
                        errors.taskTitle
                          ? "border-red-500 font-PeydaRegular border-2"
                          : ""
                      }`}
                      placeholder="عنوان تسک *"
                      placeholderTextColor="#9ca3af"
                      value={taskTitle}
                      onChangeText={(text) => {
                        setTaskTitle(text);
                        setTaskNameEntered(text.length > 0);
                        setErrors({ ...errors, taskTitle: null });
                      }}
                    />
                    {errors.taskTitle && (
                      <Text className="text-red-500 font-PeydaRegular text-right mb-2">
                        {errors.taskTitle}
                      </Text>
                    )}

                    <View className="mb-4">
                      <Text className="text-white text-center text-lg font-PeydaBlack mb-2">
                        درجه سختی *
                      </Text>
                      <View className="flex-row justify-between">
                        {["S", "M", "L", "XL"].map((size) => (
                          <TouchableOpacity
                            key={size}
                            className={`flex-1 items-center justify-center py-3 mx-1 rounded-lg ${
                              selectedDifficulty === size
                                ? "bg-blue-500"
                                : "bg-zinc-800"
                            }`}
                            onPress={() => {
                              setSelectedDifficulty(size);
                              setErrors({ ...errors, difficulty: null });
                            }}
                          >
                            <Text
                              className={`text-lg font-PeydaBold ${
                                selectedDifficulty === size
                                  ? "text-white"
                                  : "text-gray-400"
                              }`}
                            >
                              {size}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      {errors.difficulty && (
                        <Text className="text-red-500 font-PeydaRegular text-right mt-2">
                          {errors.difficulty}
                        </Text>
                      )}
                    </View>

                    <View className="mb-4">
                      <Text className="text-white text-lg text-center font-PeydaBlack mb-2">
                        زمان انجام *
                      </Text>
                      <View className="flex-row justify-between mb-4">
                        {["today", "tomorrow", "custom"].map((type) => (
                          <TouchableOpacity
                            key={type}
                            className={`flex-1 items-center justify-center py-3 mx-1 rounded-lg ${
                              selectedDateType === type
                                ? "bg-blue-500"
                                : "bg-zinc-800"
                            }`}
                            onPress={() => {
                              setSelectedDateType(type);
                              if (type === "custom") {
                                setCalendarVisible(true);
                              } else {
                                setCalendarVisible(false);
                              }
                              setErrors({ ...errors, dateType: null });
                            }}
                          >
                            <Text
                              className={`font-PeydaRegular ${
                                selectedDateType === type
                                  ? "text-white"
                                  : "text-gray-400"
                              }`}
                            >
                              {type === "today"
                                ? "امروز"
                                : type === "tomorrow"
                                ? "فردا"
                                : selectedDate || "انتخاب تاریخ"}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>

                      {calendarVisible && (
                        <View className="bg-zinc-800 p-4 rounded-lg mb-4">
                          <DatePicker
                            mode="calendar"
                            isGregorian={false}
                            minimumDate={moment().format("jYYYY/jMM/jDD")}
                            onDateChange={handleDateChange}
                            options={{
                              textHeaderColor: "#2f76ee",
                              textDefaultColor: "#fff",
                              selectedTextColor: "#ffffff",
                              mainColor: "#2f76ee",
                              textSecondaryColor: "#fff",
                              borderColor: "rgba(122, 146, 165, 0.1)",
                              backgroundColor: "#232325",

                              defaultFont: "PeydaRegular",
                              headerFont: "PeydaSemiBold",
                            }}
                            style={{ borderRadius: 10 }}
                          />
                        </View>
                      )}

                      <View className="flex-row-reverse justify-between w-full px-1 items-center">
                        <TextInput
                          className={`bg-zinc-800 text-white p-3 text-center text-lg font-PeydaRegular rounded-lg w-1/3 ${
                            errors.minute
                              ? "border-red-500 font-PeydaRegular border-2"
                              : ""
                          }`}
                          placeholder="دقیقه *"
                          placeholderTextColor="#9ca3af"
                          keyboardType="number-pad"
                          maxLength={2}
                          value={selectedMinute}
                          onChangeText={(text) => {
                            const minute = parseInt(text);
                            if (!isNaN(minute) && minute >= 0 && minute < 60) {
                              setSelectedMinute(text);
                              setErrors({ ...errors, minute: null });
                            } else if (text === "") {
                              setSelectedMinute("");
                              setErrors({ ...errors, minute: null });
                            }
                          }}
                        />
                        <Text className="text-white text-2xl font-PeydaBlack mx-2">
                          :
                        </Text>
                        <TextInput
                          className={`bg-zinc-800 text-white p-3 text-center text-lg font-PeydaRegular rounded-lg w-1/3 ${
                            errors.hour
                              ? "border-red-500 font-PeydaRegular border-2"
                              : ""
                          }`}
                          placeholder="ساعت *"
                          placeholderTextColor="#9ca3af"
                          keyboardType="number-pad"
                          maxLength={2}
                          value={selectedHour}
                          onChangeText={(text) => {
                            const hour = parseInt(text);
                            if (!isNaN(hour) && hour >= 0 && hour < 24) {
                              setSelectedHour(text);
                              setErrors({ ...errors, hour: null });
                            } else if (text === "") {
                              setSelectedHour("");
                              setErrors({ ...errors, hour: null });
                            }
                          }}
                        />
                      </View>
                    </View>

                    {Object.values(errors).some((error) => error) && (
                      <Text className="text-red-500 text-center mt-2">
                        لطفا تمام فیلدهای الزامی را پر کنید
                      </Text>
                    )}
                  </ScrollView>
                </View>
              </View>
            </KeyboardAvoidingView>
          </Modal>
        </Animated.ScrollView>
      </View>
      <TouchableOpacity
        className="absolute top-[90%] left-[82%] bg-blue-500 rounded-full w-12 h-12 flex items-center justify-center shadow-lg z-[99]"
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={30} color="black" />
      </TouchableOpacity>
      <StatusBar style="light" />
    </View>
  );
};

export default HomePage;
