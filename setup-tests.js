const originalConsoleError = console.error;

// Silence warnings on not using "act" until it can actually be done
// https://github.com/callstack/react-native-testing-library/issues/176
console.error = message => {
  if (/^Warning:/.test(message)) {
    // console.warn(`Silencing false-positive React-Native errors`);
    return;
  }

  originalConsoleError(message);
};
