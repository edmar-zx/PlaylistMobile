import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  FlatList,
  ImageBackground,
  Image
} from "react-native";
import { carregarDados, remover } from "../config/database";
import { Audio } from "expo-av";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";

import { useNavigation } from "@react-navigation/native";
import { globalStyles } from "../styles/globalStyles";

export default function PlayListScreen() {
  const navigation = useNavigation();
  const [lista, setLista] = useState<any[]>([]);
  const [som, setSom] = useState<Audio.Sound | null>(null);
  const [incremento, setIncremento] = useState(0);
  const [tocando, setTocando] = useState(false);

  useEffect(() => {
    const buscarMusicas = async () => {
      const resposta = await carregarDados();
      setLista(resposta);
    };
    buscarMusicas();
  }, []);

  useEffect(() => {
    return som
      ? () => {
        som.unloadAsync();
      }
      : undefined;
  }, [som]);

  const tocar = async (uri: string) => {
    try {
      if (som) {
        if (tocando) {
          await som.pauseAsync();
          setTocando(false);
        } else {
          await som.playAsync();
          setTocando(true);
        }
      } else {
        const { sound } = await Audio.Sound.createAsync({ uri });
        setSom(sound);
        setTocando(true);
        await sound.playAsync();
      }
    } catch (error) {
      console.error("Erro ao tocar áudio:", error);
    }
  };

  const proxima = async () => {
    try {
      if (som) {
        await som.unloadAsync();
        setSom(null);
        setTocando(false);
      }
      const proximoIndex = (incremento + 1) % lista.length;
      setIncremento(proximoIndex);
      const { sound } = await Audio.Sound.createAsync({
        uri: lista[proximoIndex].uri,
      });
      setSom(sound);
      await sound.playAsync();
      setTocando(true);
    } catch (error) {
      console.error("Erro ao trocar música:", error);
    }
  };

  const anterior = async () => {
    try {
      if (som) {
        await som.unloadAsync();
        setSom(null);
        setTocando(false);
      }

      let anteriorIndex = 0;

      if (incremento === 0) {
        setIncremento(lista.length - 1);
        anteriorIndex = lista.length - 1;
      } else {
        anteriorIndex = (incremento - 1) % lista.length;
        setIncremento(anteriorIndex);
      }

      const { sound } = await Audio.Sound.createAsync({
        uri: lista[anteriorIndex].uri,
      });
      setSom(sound);
      await sound.playAsync();
      setTocando(true);
    } catch (error) {
      console.error("Erro ao trocar música:", error);
    }
  };

  if (lista.length === 0) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <Text>Carregando músicas...</Text>
      </SafeAreaView>
    );
  }

  return (
      <ImageBackground
        source={require('../images/fundo-de-luzes-gradientes.jpg')}
        style={globalStyles.container}
      >
        <View style={globalStyles.header}>
          <TouchableOpacity
            style={globalStyles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={globalStyles.title}>Sua Playlist</Text>

          <View>
            <Image
              source={require('../images/adolescente-gotico-de-tiro-medio-posando-no-estudio.jpg')}
              style={globalStyles.profileImage}
            />
          </View>
        </View>
        <FlatList
          data={lista}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item, index }) => {
            const isPlaying = incremento === index;

            return (
              <View style={[styles.listItem, isPlaying && styles.listItemPlaying]}>
                <View style={styles.iconWrapper}>
                  <Icon name="music" size={30} color="#000000" />
                </View>

                <TouchableOpacity
                  style={styles.touchable}
                  onPress={async () => {
                    try {
                      if (som) {
                        await som.unloadAsync();
                        setSom(null);
                        setTocando(false);
                      }
                      const { sound } = await Audio.Sound.createAsync({
                        uri: item.uri,
                      });
                      setSom(sound);
                      await sound.playAsync();
                      setTocando(true);
                      setIncremento(index);
                    } catch (error) {
                      console.error("Erro ao trocar música:", error);
                    }
                  }}
                >
                  <Text style={styles.itemText} numberOfLines={1} ellipsizeMode="tail">
                    {item.nome}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => {
                    remover(item.id);
                    setLista(lista.filter((musica) => musica.id !== item.id));
                  }}
                >
                  <Feather name="trash" size={20} color="#ffffffff" />
                </TouchableOpacity>
              </View>
            );
          }}
        />
    
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.buttonNext} onPress={anterior}>
            <Feather name="skip-back" size={25} color="#ffffffff" />
          </TouchableOpacity>
        
          <TouchableOpacity
            style={styles.buttonPlay}
            onPress={() => {
              if (lista[incremento]) {
                tocar(lista[incremento].uri);
              }
            }}
          >
            {tocando ? (
              <View style={styles.view}>
                <Feather name="pause" size={25} color={"#ffffffff"} />
              </View>
            ) : (
              <View style={styles.view}>
                <Feather name="play" size={25} color={"#ffffffff"} />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonNext} onPress={proxima}>
            <Feather name="skip-forward" size={25} color="#ffffffff" />
          </TouchableOpacity>
        </View>

      </ImageBackground>

   
  );
}

export const styles = StyleSheet.create({
  buttonPlay: {
    padding: 20,
    backgroundColor: "#ffffff49",
    borderRadius: 50,
  },
  buttonNext: {
    padding: 20,
    borderRadius: 50,
  },
  texto: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
    textAlign: "center",
  },
  view: {
    justifyContent: "flex-end",
    alignItems: "center",
    flexDirection: "row",
  },
  listContainer: {
    marginTop: 20,
    padding: 10,
    borderRadius: 8,

  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginBottom: 14,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",

  },

  listItemPlaying: {
    borderColor: "#ffffffff",
  },
  iconWrapper: {
    marginRight: 15,
    backgroundColor: "#ffffff",
    padding: 10,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  touchable: {
    flex: 1,
  },

  itemText: {
    flexShrink: 1, 
    color: "#ffffff",

  },
  buttons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 60,
    marginTop: 10,
  },

  removeButton: {
    marginLeft: 10
  },
});
