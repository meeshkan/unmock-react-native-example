import React, {useState, useEffect} from 'react';
import {Button, StyleSheet, View, Text} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';

const fetchFact = async () => {
  console.log(`Fetching new cat fact`);
  const fetchResult = await fetch(
    'https://cat-fact.herokuapp.com/facts/random?animal_type=cat&amount=1',
  );
  if (!fetchResult.ok) {
    throw Error(`Failed fetching cat fact with code: ${fetchResult.status}`);
  }
  const body = await fetchResult.json();
  const fact = body.text;
  console.log(`Got a new fact: ${fact}`);
  return fact;
};

const App = () => {
  const [fact, setFact] = useState('');
  const [err, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const refreshJoke = async () => {
    try {
      setLoading(true);
      const fact = await fetchFact();
      setFact(fact);
      setError(null);
      console.log(`Set fact: ${fact}`);
    } catch (err) {
      console.error(`Failed fetching fact: ${err.message}`);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshJoke();
  }, []);

  return (
    <>
      <View style={styles.body}>
        <View style={styles.container}>
          <Text style={styles.title}>Your daily cat fact</Text>
          {loading ? (
            <Text style={styles.loading} testID="loading">
              Loading...
            </Text>
          ) : err ? (
            <Text style={{...styles.joke, ...styles.error}} testID="error">
              Something went horribly wrong, please try again!
            </Text>
          ) : (
            <Text style={styles.joke} testID="joke">
              {fact ? fact : 'Loading...'}
            </Text>
          )}
          <View style={styles.buttonContainer}>
            <Button
              title={'Get me a new one'}
              onPress={refreshJoke}
              color="blue"
            />
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  body: {
    backgroundColor: Colors.lighter,
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  joke: {
    padding: 20,
    width: '100%',
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
    textAlign: 'center',
  },
  loading: {
    color: 'gray',
  },
  error: {
    backgroundColor: 'red',
  },
  buttonContainer: {
    margin: 20,
  },
});

export default App;
