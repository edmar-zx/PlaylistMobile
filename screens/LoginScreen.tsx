import React, { useCallback } from "react";
import * as LocalAuthentication from "expo-local-authentication";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

import { Alert, SafeAreaView, TouchableOpacity, Text, StyleSheet, ImageBackground, View } from "react-native";
import { globalStyles } from "../styles/globalStyles";

export default function LoginScreen({ navigation }: any) {

  const autenticar = useCallback(async () => {
    try {
      const temLeitor = await LocalAuthentication.hasHardwareAsync();
      const temBiometria = await LocalAuthentication.isEnrolledAsync();
      const validacaoBiometrica = await LocalAuthentication.authenticateAsync();

      if (!temLeitor) return Alert.alert('nao tem leitor');
      if (!temBiometria) return Alert.alert('Sem digital');
      if (validacaoBiometrica) return navigation.navigate('Home');
    } catch (err) {
      Alert.alert("Ocorreu um erro no processo de biométrico!" + err);
    }

  }, [navigation]);

  return (

    <ImageBackground
      source={require('../images/fundo-de-luzes-gradientes.jpg')}
      style={globalStyles.container}
    >
      <Text style={styles.title}>Seja bem-vindo!</Text>
      <View style={styles.container}>

        <Text style={styles.titleBiometrics}>Acesse com sua biometria</Text>
        <TouchableOpacity style={styles.fingerprintButton} onPress={autenticar}>
          <Icon name="fingerprint" size={90} color="#ffffffff" />
        </TouchableOpacity>
        <Text style={styles.infoText}>Toque no ícone para autenticar</Text>
      </View>

    </ImageBackground>


  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginTop: 40,
    padding: 16,

  },
  titleBiometrics: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffffff",
    marginBottom: 30,
    textAlign: "center",
    flexWrap: "wrap",
    paddingHorizontal: 10,
    width: "100%",
  },
  fingerprintButton: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 25,
    borderRadius: 100,
    marginBottom: 20,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  infoText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.5)",
    textAlign: "center",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    width: "100%",
  },
});