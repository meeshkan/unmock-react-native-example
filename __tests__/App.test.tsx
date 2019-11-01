import 'react-native';
import React from 'react';
import App from '../src/App';

import unmock, {transform, u} from 'unmock';

import {
  fireEvent,
  render,
  RenderAPI,
  waitForElement,
} from 'react-native-testing-library';

// Required to turn "fetch" calls into Node.js calls that unmock(-node) can intercept
// @ts-ignore
global.fetch = require('node-fetch');

// https://cat-fact.herokuapp.com/facts/random?animal_type=cat&amount=1

describe('App', () => {
  beforeAll(() => {
    unmock.on();
    unmock
      .nock('https://cat-fact.herokuapp.com', 'catFactApi')
      .get('/facts/random?animal_type=cat&amount=1')
      .reply(200, {text: u.string('lorem.sentence')})
      .reply(500, 'Internal server error');
  });
  beforeEach(() => {
    unmock.reset();
  });
  it('renders the fact block when API succeeds', async () => {
    const api = unmock.services['catFactApi'];
    api.state(transform.withCodes(200));
    const renderApi: RenderAPI = render(<App />);

    await waitForElement(() => {
      return renderApi.getByTestId('fact');
    });
  });
  it('renders the fact returned from the API when API succeeds', async () => {
    const api = unmock.services['catFactApi'];
    api.state(transform.withCodes(200));
    const renderApi: RenderAPI = render(<App />);

    await waitForElement(() => {
      const returnedFact = api.spy.getResponseBodyAsJson().text;
      return renderApi.getByText(returnedFact);
    });
  });
  it('renders new fact after clicking the button', async () => {
    const api = unmock.services['catFactApi'];
    api.state(transform.withCodes(200));

    const renderApi: RenderAPI = render(<App />);

    fireEvent.press(renderApi.getByText('Get me a new one'));

    await waitForElement(() => {
      const secondCall = api.spy.secondCall;
      const secondFact = secondCall.returnValue.bodyAsJson;
      return renderApi.getByText(secondFact.text);
    });
  });
  it('renders error when the API fails', async () => {
    const api = unmock.services['catFactApi'];
    api.state(transform.withCodes(500));

    const renderApi: RenderAPI = render(<App />);

    await waitForElement(() => {
      return renderApi.getByTestId('error');
    });
  });
  afterAll(() => {
    unmock.off();
  });
});
