document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');

  logoutBtn.addEventListener('click', () => {
    fetch('/logout', {
      method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
      console.log(data.message);
    })
    .catch(error => {
      // Handle any errors that occur during the request
      console.error('Error sending logout request:', error);
    });
  });
})