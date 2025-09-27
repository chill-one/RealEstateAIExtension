document.getElementById('surveyForm').addEventListener('submit', function(e) {
    e.preventDefault();
  
    const preferences = {
      school: document.getElementById('school').value,
      crime: document.getElementById('crime').value,
      income: document.getElementById('income').value,
      transportation: document.getElementById('transportation').value,
      healthyFoodChoices: document.getElementById('foodChoices').value,
      naturalDisasters: document.getElementById('naturalDisasters').value
    };
  
    // Send the preferences to the backend via a POST request
    fetch('http://localhost:5000/saveSurvey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preferences)
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      alert('Survey submitted successfully!');
    })
    .catch((error) => {
      console.error('Error:', error);
      alert('Error submitting survey.');
    });
  });
  