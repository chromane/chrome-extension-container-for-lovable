import React from 'react';

const App = () => {
  let [a, setA] = React.useState(1);
  let [b, setB] = React.useState(2);
  return (
    <div>
      <div>react test {a + b}</div>
      <button onClick={() => setA(a + 1)}>+1</button>
      <button onClick={() => setB(b + 1)}>+2</button>
    </div>
  );
};

export default App;
