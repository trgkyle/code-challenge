var sum_to_n_a = function (n) {
  return (n * (n + 1)) / 2;
};

var sum_to_n_b = function (n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
};

var sum_to_n_c = function (n) {
  if (n <= 0) return 0;
  return n + sum_to_n_c(n - 1);
};

// Test function
function runTests() {
  const testCases = [
    { input: 5, expected: 15 },
    { input: 10, expected: 55 },
    { input: 100, expected: 5050 },
    { input: 0, expected: 0 },
    { input: 1, expected: 1 },
  ];

  console.log("Running tests...\n");

  testCases.forEach((test, index) => {
    console.log(`Test Case ${index + 1}: n = ${test.input}`);

    const resultA = sum_to_n_a(test.input);
    console.log(
      `Implementation A: ${resultA} ${resultA === test.expected ? "✓" : "✗"}`
    );

    const resultB = sum_to_n_b(test.input);
    console.log(
      `Implementation B: ${resultB} ${resultB === test.expected ? "✓" : "✗"}`
    );

    const resultC = sum_to_n_c(test.input);
    console.log(
      `Implementation C: ${resultC} ${resultC === test.expected ? "✓" : "✗"}`
    );

    console.log("-------------------");
  });
}

runTests();
