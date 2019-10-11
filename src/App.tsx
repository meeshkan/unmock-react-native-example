import React, {useState, useEffect} from 'react';
import {Button, StyleSheet, View, Text} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import UnmockMitm, {unmockFetch} from 'unmock-fetch';

const url =
  'http://api.icndb.com/jokes/random?limitTo=[nerdy]&exclude=[explicit]';

const fetchJokeInternal = async () => {
  console.log('Fetching a new joke');
  const fetchResult = await fetch(url);
  if (!fetchResult.ok) {
    throw Error(`Failed fetching joke with code: ${fetchResult.status}`);
  }
  const body = await fetchResult.json();
  console.log(`Got response json: ${JSON.stringify(body)}`);
  const joke = body.value.joke;
  console.log(`Got a new joke: ${joke}`);
  return joke;
};

const fetchJoke = async ({useUnmock = false}: {useUnmock: boolean}) => {
  try {
    if (useUnmock) {
      UnmockMitm.on();
    }
    return await fetchJokeInternal();
  } finally {
    UnmockMitm.off();
  }
};

const App = () => {
  const [joke, setJoke] = useState('');
  const [err, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const refreshJoke = async () => {
    try {
      setLoading(true);
      const joke = await fetchJoke({useUnmock: false});
      setJoke(joke);
      setError(null);
      console.log(`Set joke: ${joke}`);
    } catch (err) {
      console.error(`Failed fetching joke: ${err.message}`);
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
          <Text style={styles.title}>Your daily Chuck Norris joke</Text>
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
              {joke ? joke : 'Loading...'}
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
