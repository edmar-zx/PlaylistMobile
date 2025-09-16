import React, { useEffect, useState, useRef } from "react";
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


type AudioPlayback = {
  sound: Audio.Sound;
  status: any;
};

export default function PlayListScreen() {
  const navigation = useNavigation();
  const [lista, setLista] = useState<any[]>([]);
  const [som, setSom] = useState<Audio.Sound | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [tocando, setTocando] = useState(false);
  const [modoAleatorio, setModoAleatorio] = useState(false);
  const isMounted = useRef(true);

useEffect(() => {
  isMounted.current = true;
  return () => {
    isMounted.current = false;

    if (som) {
      som.setOnPlaybackStatusUpdate(null);
      som.unloadAsync();
    }
  };
}, [som]);


  useEffect(() => {
    const buscarMusicas = async () => {
      const resposta = await carregarDados();
      setLista(resposta);
    };
    buscarMusicas();
  }, []);

  useEffect(() => {
    const playbackStatusUpdate = (status: any) => {
      if (!status.isLoaded) return;

      if (status.didJustFinish && !status.isLooping) {
        if (isMounted.current) {
          proxima();
        }
      }
    };

    if (som) {
      som.setOnPlaybackStatusUpdate(playbackStatusUpdate);
    }

    return () => {
      if (som) {
        som.setOnPlaybackStatusUpdate(null);
      }
    };
  }, [som]);

  const tocar = async (uri: string, index: number) => {
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
        setCurrentTrackIndex(index);
        await sound.playAsync();
      }
    } catch (error) {
      console.error("Erro ao tocar áudio:", error);
    }
  };

  const proxima = async () => {
    try {
      if (lista.length === 0) return;

      if (som) {
        await som.unloadAsync();
        setSom(null);
        setTocando(false);
      }

      let proximoIndex;
      
      if (modoAleatorio) {
        let randomIndex = Math.floor(Math.random() * lista.length);
        while (randomIndex === currentTrackIndex && lista.length > 1) {
          randomIndex = Math.floor(Math.random() * lista.length);
        }
        proximoIndex = randomIndex;
      } else {
        proximoIndex = (currentTrackIndex + 1) % lista.length;
      }
      
      setCurrentTrackIndex(proximoIndex);
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
      if (lista.length === 0) return;

      if (som) {
        await som.unloadAsync();
        setSom(null);
        setTocando(false);
      }

      let anteriorIndex = currentTrackIndex - 1;
      if (anteriorIndex < 0) {
        anteriorIndex = lista.length - 1;
      }
      
      setCurrentTrackIndex(anteriorIndex);
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

  const toggleModoAleatorio = () => {
    setModoAleatorio(!modoAleatorio);
  };

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
          const isPlaying = currentTrackIndex === index;

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
                    setCurrentTrackIndex(index);
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
                  
                  // Se a música removida era a atual vamos para a proxima
                  if (currentTrackIndex === index) {
                    if (lista.length === 1) {
                      // Se era a ultima musica para a reprodução
                      if (som) {
                        som.unloadAsync();
                        setSom(null);
                        setTocando(false);
                        setCurrentTrackIndex(0);
                      }
                    } else {
                      proxima();
                    }
                  } else if (currentTrackIndex > index) {
                    // Ajusta o indice atual se a musica removida estava antes da atual
                    setCurrentTrackIndex(currentTrackIndex - 1);
                  }
                }}
              >
                <Feather name="trash" size={20} color="#ffffffff" />
              </TouchableOpacity>
            </View>
          );
        }}
      />

      <View style={styles.buttons}>
        <TouchableOpacity 
          style={[styles.buttonNext, modoAleatorio && styles.buttonActive]} 
          onPress={toggleModoAleatorio}
        >
          <Feather name="shuffle" size={25} color={modoAleatorio ? "#FFD700" : "#ffffffff"} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonNext} onPress={anterior}>
          <Feather name="skip-back" size={25} color="#ffffffff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonPlay}
          onPress={() => {
            if (lista[currentTrackIndex]) {
              tocar(lista[currentTrackIndex].uri, currentTrackIndex);
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
        <View style={{ width: 40 }} />
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
  buttonActive: {
    backgroundColor: "#ffffff30",
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