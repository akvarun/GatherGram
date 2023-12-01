import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Platform,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native";
import UserListItem from "../components/UserListItem";

import { View, Text } from "../components/Themed";
import { AntDesign } from "@expo/vector-icons";
import CustomButton from "../components/CustomButton";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useUserId } from "@nhost/react";

const GetEvent = gql`
  query GetEvent($id: uuid!) {
    Event_by_pk(id: $id) {
      id
      name
      date
      description
      EventAttendee {
        user {
          id
          displayName
          avatarUrl
        }
      }
    }
  }
`;

const JoinEvent = gql`
  mutation InsertEventAttendee($eventId: uuid!, $userId: uuid!) {
    insert_EventAttendee(objects: [{ eventId: $eventId, userId: $userId }]) {
      returning {
        id
        userId
        eventId
        Event {
          id
          EventAttendee {
            id
          }
        }
      }
    }
  }
`;

export default function ModalScreen({ route }) {
  const id = route?.params?.id;
  const userId = useUserId();

  const { data, loading, error } = useQuery(GetEvent, { variables: { id } });
  const event = data?.Event_by_pk;

  const [doJoinEvent] = useMutation(JoinEvent);

  const displayedUsers = (event?.EventAttendee || [])
    .slice(0, 5)
    .map((attendee) => attendee.user);

  const joined = event?.EventAttendee?.some(
    (attendee) => attendee.user?.id === userId
  );
  const flattenedUsers = displayedUsers.flat();
  const onJoin = async () => {
    try {
      if (flattenedUsers.length >= 5) {
        Alert.alert(
          "Event Full",
          "The event is already full. You cannot join."
        );
      } else {
        const isUserAlreadyJoined = flattenedUsers.some(
          (attendee) => attendee.id === userId
        );

        if (isUserAlreadyJoined) {
          Alert.alert(
            "Already Joined",
            "You are already registered for this event."
          );
        } else {
          await doJoinEvent({ variables: { userId, eventId: id } });
        }
      }
    } catch (error) {
      if (error.message.includes("Uniqueness violation")) {
        Alert.alert(
          "Already Joined",
          "You have already registered for this event."
        );
      } else {
        Alert.alert(
          "Join Error",
          "There was an error while attempting to join the event."
        );
        console.error("Join Error:", error);
      }
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Couldn't find the event</Text>
        <Text>{error.message}</Text>
      </View>
    );
  }

  if (loading) {
    return <ActivityIndicator />;
  }
  // Flatten the array of arrays into a single array of user objects

  console.log(displayedUsers);
  // Log flattened users array
  console.log("Flattened Users:", flattenedUsers);

  // Log user details for each user
  flattenedUsers.forEach((user) => {
    console.log("User Details:", user);
    console.log("Avatar URL:", user?.avatarUrl || "N/A");
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{event.name}</Text>

      <Text style={styles.description}>{event.description}</Text>

      <Text style={styles.time}>
        <AntDesign name="calendar" size={24} color={"black"} />{" "}
        {new Date(event.date).toDateString()}
      </Text>

      <View style={styles.footer}>
        {/* User avatars */}
        <View style={styles.users}>
          {flattenedUsers.map((user, index) => (
            <Image
              key={user.id}
              source={{ uri: user.avatarUrl }}
              style={[
                styles.userAvatar,
                { transform: [{ translateX: -15 * index }] },
              ]}
            />
          ))}
          <View
            style={[
              styles.userAvatar,
              { transform: [{ translateX: -15 * displayedUsers.length }] },
            ]}
          >
            <Text>+{event?.EventAttendee?.length - displayedUsers.length}</Text>
          </View>
        </View>

        {!joined ? (
          <CustomButton text="Join the event" onPress={onJoin} />
        ) : null}
      </View>

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingBottom: 25,
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    marginVertical: 10,
    marginTop: 20,
  },
  description: {
    fontSize: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  time: {
    fontSize: 20,
  },
  footer: {
    marginTop: "auto",
    alignItems: "center",
  },
  users: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  userAvatar: {
    width: 50,
    aspectRatio: 1,
    borderRadius: 25,
    margin: 2,
    borderWidth: 2,
    borderColor: "white",
    backgroundColor: "gainsboro",
    justifyContent: "center",
    alignItems: "center",
  },
  joinedText: {
    fontSize: 16,
    marginTop: 10,
    color: "gray",
  },
});
