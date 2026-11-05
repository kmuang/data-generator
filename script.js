document.getElementById('theme-toggle').addEventListener('click', function () {
  document.body.classList.toggle('dark-mode');

  const isDarkMode = document.body.classList.contains('dark-mode');
  this.textContent = isDarkMode ? '☀️' : '🌙';
  this.setAttribute(
    'aria-label',
    isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'
  );
});

document
  .getElementById('generate-button')
  .addEventListener('click', generateFakeData);

function generateFakeData() {
  const recordCount = Number(document.getElementById('numRecords').value);
  const selectedFields = [
    'name',
    'email',
    'phone',
    'address',
    'job',
    'company',
    'username',
    'website',
    'birthdate',
    'country',
    'age',
    'city',
    'race',
    'salaryUsd',
  ].filter(field => document.getElementById(field).checked);

  if (!Number.isInteger(recordCount) || recordCount < 1 || recordCount > 10) {
    showAlert('Choose a whole number of records from 1 to 10.', 'warning');
    return;
  }

  if (selectedFields.length === 0) {
    showAlert('Select at least one data field.', 'warning');
    return;
  }

  const allFakeData = Array.from({ length: recordCount }, () => {
    const record = {};

    if (selectedFields.includes('name')) {
      record.name = faker.name.findName();
    }
    if (selectedFields.includes('email')) {
      record.email = faker.internet.email();
    }
    if (selectedFields.includes('phone')) {
      record.phone = faker.phone.phoneNumber('+1 (###) ###-####');
    }
    if (selectedFields.includes('address')) {
      record.address = {
        street1: faker.address.streetAddress(),
        street2: faker.address.secondaryAddress() || '',
        city: faker.address.city(),
        state: faker.address.state(),
        zipcode: faker.address.zipCode(),
      };
    }
    if (selectedFields.includes('job')) {
      record.job = faker.name.jobTitle();
    }
    if (selectedFields.includes('company')) {
      record.company = faker.company.companyName();
    }
    if (selectedFields.includes('username')) {
      record.username = faker.internet.userName();
    }
    if (selectedFields.includes('website')) {
      record.website = faker.internet.url();
    }
    if (selectedFields.includes('birthdate')) {
      record.birthdate = faker.date.past().toISOString().slice(0, 10);
    }
    if (selectedFields.includes('country')) {
      record.country = faker.address.country();
    }
    if (selectedFields.includes('age')) {
      record.age = faker.random.number({ min: 18, max: 80 });
    }
    if (selectedFields.includes('city')) {
      record.city = faker.address.city();
    }
    if (selectedFields.includes('race')) {
      record.race = faker.random.arrayElement([
        'Asian',
        'Black',
        'Hispanic or Latino',
        'Indigenous',
        'Middle Eastern',
        'Pacific Islander',
        'White',
        'Multiracial',
      ]);
    }
    if (selectedFields.includes('salaryUsd')) {
      record.salaryUsd = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(faker.random.number({ min: 30000, max: 150000 }));
    }

    return record;
  });

  const selectedFormat = document.querySelector(
    'input[name="format"]:checked'
  ).value;
  const outputContent = formatFakeData(allFakeData, selectedFormat);
  const outputContainer = document.getElementById('output-container');
  const output = document.createElement('pre');

  output.textContent = outputContent;
  outputContainer.replaceChildren(output);
}

function formatFakeData(records, format) {
  switch (format) {
    case 'json':
      return JSON.stringify(records, null, 2);
    case 'html':
      return records
        .map(
          record =>
            `<article>\n${Object.entries(record)
              .map(
                ([key, value]) =>
                  `  <p><strong>${escapeHtml(key)}:</strong> ${escapeHtml(
                    formatCellValue(value)
                  )}</p>`
              )
              .join('\n')}\n</article>`
        )
        .join('\n<hr>\n');
    case 'javascript':
      return `const fakeData = ${JSON.stringify(records, null, 2)};`;
    case 'typescript':
      return `const fakeData: Array<Record<string, unknown>> = ${JSON.stringify(
        records,
        null,
        2
      )};`;
    case 'python':
      return `data = ${toPythonLiteral(records)}`;
    case 'yaml':
      return toYaml(records);
    case 'text':
      return records
        .map(
          (record, index) =>
            `Record ${index + 1}\n${Object.entries(record)
              .map(([key, value]) => `  ${key}: ${formatCellValue(value)}`)
              .join('\n')}`
        )
        .join('\n\n');
    case 'sql':
      return records
        .map(record => {
          const columns = Object.keys(record);
          const values = columns.map(column => toSqlLiteral(record[column]));
          return [
            'INSERT INTO users (',
            ...columns.map((column, index) =>
              `  ${toSqlIdentifier(column)}${index < columns.length - 1 ? ',' : ''}`
            ),
            ') VALUES (',
            ...values.map((value, index) =>
              `  ${value}${index < values.length - 1 ? ',' : ''}`
            ),
            ');',
          ].join('\n');
        })
        .join('\n');
    default:
      throw new Error(`Unsupported output format: ${format}`);
  }
}

function toYaml(value, indent = 0) {
  const padding = ' '.repeat(indent);

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return `${padding}[]`;
    }
    return value
      .map(item => {
        if (item !== null && typeof item === 'object') {
          return `${padding}-\n${toYaml(item, indent + 2)}`;
        }
        return `${padding}- ${toYamlScalar(item)}`;
      })
      .join('\n');
  }

  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value);
    if (entries.length === 0) {
      return `${padding}{}`;
    }
    return entries
      .map(([key, item]) => {
        const yamlKey = JSON.stringify(key);
        if (item !== null && typeof item === 'object') {
          return `${padding}${yamlKey}:\n${toYaml(item, indent + 2)}`;
        }
        return `${padding}${yamlKey}: ${toYamlScalar(item)}`;
      })
      .join('\n');
  }

  return `${padding}${toYamlScalar(value)}`;
}

function toYamlScalar(value) {
  if (typeof value === 'string') {
    return JSON.stringify(value);
  }
  if (value === null) {
    return 'null';
  }
  return String(value);
}

function formatCellValue(value) {
  return value !== null && typeof value === 'object'
    ? JSON.stringify(value)
    : String(value);
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, character => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });
}

function toPythonLiteral(value, indent = 0) {
  const padding = ' '.repeat(indent);
  const childPadding = ' '.repeat(indent + 4);

  if (value === null) {
    return 'None';
  }
  if (typeof value === 'string') {
    return JSON.stringify(value);
  }
  if (typeof value === 'boolean') {
    return value ? 'True' : 'False';
  }
  if (typeof value === 'number') {
    return String(value);
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return '[]';
    }
    return `[\n${value
      .map(item => `${childPadding}${toPythonLiteral(item, indent + 4)}`)
      .join(',\n')}\n${padding}]`;
  }
  const entries = Object.entries(value);
  if (entries.length === 0) {
    return '{}';
  }
  return `{\n${entries
    .map(
      ([key, entry]) =>
        `${childPadding}${toPythonLiteral(key)}: ${toPythonLiteral(
          entry,
          indent + 4
        )}`
    )
    .join(',\n')}\n${padding}}`;
}

function toSqlIdentifier(identifier) {
  return `"${identifier.replace(/"/g, '""')}"`;
}

function toSqlLiteral(value) {
  if (value === null) {
    return 'NULL';
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new Error('SQL output cannot represent non-finite numbers.');
    }
    return String(value);
  }
  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  }
  const serialized =
    typeof value === 'object' ? JSON.stringify(value) : String(value);
  return `'${serialized.replace(/'/g, "''")}'`;
}

function showAlert(message, type = 'info') {
  const alertContainer = document.querySelector('.alert-container');
  const alert = document.createElement('div');
  const messageText = document.createElement('span');
  const closeButton = document.createElement('button');

  alert.classList.add('alert', type, 'show');
  messageText.textContent = message;
  closeButton.className = 'close-btn';
  closeButton.setAttribute('aria-label', 'Close notification');
  closeButton.textContent = '×';
  closeButton.addEventListener('click', () => closeAlert(alert));
  alert.append(messageText, closeButton);
  alertContainer.appendChild(alert);

  setTimeout(() => closeAlert(alert), 3000);
}

function closeAlert(alert) {
  alert.classList.remove('show');
  setTimeout(() => alert.remove(), 300);
}
