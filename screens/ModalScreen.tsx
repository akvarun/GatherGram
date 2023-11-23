import { StatusBar } from "expo-status-bar";
import {
  Platform,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";

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

  const onJoin = async () => {
    if (joined) {
      Alert.alert("Already Joined", "You are already registered for this event.");
    } else {
      try {
        await doJoinEvent({ variables: { userId, eventId: id } });
      } catch (e) {
        Alert.alert("Already Joined", "You have already registered for this event", error?.message);
      }
    }
  };

 const displayedUsers = (event?.EventAttendee || [])
  .slice(0, 5)
  .map((attendee) => attendee.user);

const joined = event?.EventAttendee?.some(
  (attendee) => attendee.user?.id === userId
);

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
          {displayedUsers.map((user, index) => (
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
    fontWeight: "Roboto",
    marginVertical: 10,
    marginTop:20,
  },
  description: {
    fontSize: 16,
    marginTop:60,
    marginBottom: 80,
  },
  time: {
    fontSize: 20,
  },
  footer: {
    marginTop: "auto",
  },
  users: {
    flexDirection: "row",
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
});
