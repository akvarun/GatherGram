import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { gql, useMutation } from "@apollo/client";

const CREATE_EVENT = gql`
  mutation InsertEvent(
    $name: String!
    $description: String
    $date: timestamptz
  ) {
    insert_Event(
      objects: { name: $name, description: $description, date: $date }
    ) {
      affected_rows
    }
  }
`;

export default function CreateEventPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [createEvent] = useMutation(CREATE_EVENT);

  const handleCreateEvent = () => {
    const dateTime = `${date}T${time}:00+00:00`;

    createEvent({
      variables: { name, description, date: dateTime },
    })
      .then((result) => {
        if (result.data.insert_Event.affected_rows > 0) {
          Alert.alert("Event created successfully");
          // Optionally, you can navigate the user to the event details page or another screen.
        }
      })
      .catch((error) => {
        console.error("Failed to create event", error);
        Alert.alert("Failed to create event", error.message);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Event Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter event name"
        onChangeText={(text) => setName(text)}
      />

      <Text style={styles.label}>Event Description</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter event description"
        onChangeText={(text) => setDescription(text)}
      />

      <Text style={styles.label}>Event Date (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter event date"
        onChangeText={(text) => setDate(text)}
      />

      <Text style={styles.label}>Event Time (HH:MM)</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter event time"
        onChangeText={(text) => setTime(text)}
      />

      <Button title="Create Event" onPress={handleCreateEvent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 16,
    marginVertical: 8,
  },
  input: {
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
});
