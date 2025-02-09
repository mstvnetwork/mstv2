// functions/login.js
const members = [
  { id: 'member1', password: 'password123' },  // Replace with your actual membership data
  { id: 'member2', password: 'password456' }
];

exports.handler = async (event, context) => {
  const { id, password } = JSON.parse(event.body);

  const member = members.find((m) => m.id === id && m.password === password);

  if (member) {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Login successful' })
    };
  } else {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Invalid Membership ID or Password' })
    };
  }
};
