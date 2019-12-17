import React, {useState, useEffect} from 'react';
import {Button, StyleSheet, View, Text} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import unmock, {u} from 'unmock';
import {buildFetch} from 'unmock-fetch';

const faker = unmock.newFaker();

faker
  .nock('https://cat-fact.herokuapp.com')
  .get('/facts/random?animal_type=cat&amount=1')
  .reply(200, {text: u.string('lorem.sentence')})
  .reply(500, 'Internal server error');

const fetch = buildFetch(faker.createResponse.bind(faker));

const CAT_FACT_URL =
  'https://cat-fact.herokuapp.com/facts/random?animal_type=cat&amount=1';

const fetchFact = async () => {
  try {
    const fetchResult = await fetch(CAT_FACT_URL);
    if (!fetchResult.ok) {
      throw Error(`Failed fetching cat fact with code: ${fetchResult.status}`);
    }
    const body = await fetchResult.json();
    const fact = body.text;
    // console.log(`Got a new fact: ${fact}`);
    return fact;
  } finally {
    unmock.off();
  }
};

const App = () => {
  const [shownFact, setFact] = useState('');
  const [err, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const refreshFact = async () => {
    try {
      setLoading(true);
      const fact = await fetchFact();
      setFact(fact);
      setError(null);
      console.log(`Set fact: ${fact}`);
    } catch (err) {
      console.log(`Failed fetching fact: ${err.message}`);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshFact();
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
            <Text style={{...styles.fact, ...styles.error}} testID="error">
              Something went horribly wrong, please try again!
            </Text>
          ) : (
            <Text style={styles.fact} testID="fact">
              {shownFact}
            </Text>
          )}
          <View style={styles.buttonContainer}>
            <Button
              disabled={loading}
              title={'Get me a new one'}
              onPress={refreshFact}
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
  fact: {
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
