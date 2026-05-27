document.getElementById('theme-toggle').addEventListener('click', function () {
  document.body.classList.toggle('dark-mode');

  const isDarkMode = document.body.classList.contains('dark-mode');
  this.textContent = isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
  showAlert(isDarkMode ? 'Dark mode enabled' : 'Light mode enabled', 'info');
});

function generateFakeData() {
  const numRecords = parseInt(document.getElementById('numRecords').value) || 3;
  const allFakeData = [];

  for (let i = 0; i < numRecords; i++) {
    const fakeData = {};

    if (document.getElementById('name').checked) {
      fakeData.name = faker.name.findName();
    }
    if (document.getElementById('email').checked) {
      fakeData.email = faker.internet.email();
    }
    if (document.getElementById('phone').checked) {
      fakeData.phone = faker.phone.phoneNumber('+1 (###) ###-####');
    }
    if (document.getElementById('address').checked) {
      fakeData.address = {
        street1: faker.address.streetAddress(),
        street2: faker.address.secondaryAddress() || '',
        city: faker.address.city(),
        state: faker.address.state(),
        zipcode: faker.address.zipCode(),
      };
    }
    if (document.getElementById('job').checked) {
      fakeData.job = faker.name.jobTitle();
    }
    if (document.getElementById('company').checked) {
      fakeData.company = faker.company.companyName();
    }

    allFakeData.push(fakeData);
  }

  const selectedFormat = document.querySelector(
    'input[name="format"]:checked'
  ).value;
  let outputContent = '';

  switch (selectedFormat) {
    case 'json':
      outputContent = JSON.stringify(allFakeData, null, 2);
      break;
    case 'html':
      outputContent = allFakeData
        .map(data =>
          Object.entries(data)
            .map(
              ([key, value]) =>
                `<p><strong>${key}:</strong> ${
                  typeof value === 'object' ? JSON.stringify(value) : value
                }</p>`
            )
            .join('\n')
        )
        .join('<hr>');
      break;
    case 'javascript':
      outputContent = `const fakeData = ${JSON.stringify(
        allFakeData,
        null,
        2
      )};`;
      break;
    case 'python':
      outputContent = `fake_data = ${JSON.stringify(
        allFakeData,
        null,
        2
      ).replace(/"/g, "'")}`;
      break;
    case 'csv':
      const csvHeaders = Object.keys(allFakeData[0]).join(',');
      const csvValues = allFakeData
        .map(record => Object.values(record).join(','))
        .join('\n');
      outputContent = `${csvHeaders}\n${csvValues}`;
      break;
    case 'sql':
      outputContent = allFakeData
        .map(
          record =>
            `INSERT INTO users (${Object.keys(record).join(
              ', '
            )}) VALUES (${Object.values(record)
              .map(value => `'${value}'`)
              .join(', ')});`
        )
        .join('\n');
      break;
  }

  document.getElementById('output-container').innerHTML = `
      <button class="copy-btn" onclick="copyOutput()">📋 Copy</button>
      <pre>${outputContent}</pre>
  `;
}

function copyOutput() {
  const outputDiv = document
    .getElementById('output-container')
    .querySelector('pre');
  if (outputDiv) {
    navigator.clipboard.writeText(outputDiv.innerText).then(() => {
      alert('Copied to clipboard!');
    });
  } else {
    alert('No data to copy. Please generate fake data first.');
  }
}

// Function to Show Custom Alert
function showAlert(message, type = 'info') {
  const alertContainer = document.querySelector('.alert-container');

  // Create Alert Box
  const alert = document.createElement('div');
  alert.classList.add('alert', type, 'show');
  alert.innerHTML = `
      <span>${message}</span>
      <button class="close-btn">&times;</button>
  `;

  // Add Alert to the Container
  alertContainer.appendChild(alert);

  // Close Alert on Button Click
  alert.querySelector('.close-btn').addEventListener('click', () => {
    closeAlert(alert);
  });

  // Auto Close Alert After 3 Seconds
  setTimeout(() => closeAlert(alert), 3000);
}

// Function to Close Alert
function closeAlert(alert) {
  alert.classList.remove('show');
  setTimeout(() => alert.remove(), 300);
}

// Example Usage (Replace Default Alerts)

function copyOutput() {
  const outputDiv = document
    .getElementById('output-container')
    .querySelector('pre');
  if (outputDiv) {
    navigator.clipboard
      .writeText(outputDiv.innerText)
      .then(() => {
        showAlert('Copied to clipboard!', 'success');
      })
      .catch(() => {
        showAlert('Failed to copy text!', 'error');
      });
  } else {
    showAlert('No data to copy. Please generate fake data first.', 'warning');
  }
}
