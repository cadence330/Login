// Email Transport
document.getElementById('resetPasswordBtn').addEventListener(('click'), () => {
  fetch('/reset-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: 'user@example.com' }), // Replace with the user's email
  })
    .then(response => response.json())
    .then(data => {
      // Handle the response from the server (e.g., show a success message)
      console.log(data.message);
    })
    .catch(error => {
      // Handle any errors that occur during the request
      console.error('Error sending request:', error);
    });
})