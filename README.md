# Data Generator

A browser-based tool for generating sample records in JSON, HTML, JavaScript,
TypeScript, Python, SQL, YAML, and plain-text formats.

## Features

- Generate 1–10 records with configurable name, email, phone, address, job title,
  company, username, website, birth date, country, age, city, race, and salary
  in USD.
- Switch between light and dark themes.
- Export generated records in eight text formats.
- JSON is selected by default and supports nested data such as addresses.

## Run locally

Open `index.html` in a browser. Faker.js and the icons are loaded from public
CDNs, so an internet connection is required.

## Usage

1. Choose a record count from 1 to 10.
2. Select one or more data fields.
3. Choose an output format.
4. Select **Generate Data** to display the output.

The Python output is formatted as a readable `data` list. The SQL output
uses formatted `INSERT` statements for a table named `users`; that table must
already exist with columns matching the selected fields. Nested values such as
addresses are stored as JSON text.

## Manual verification checklist

- [ ] With all data fields unchecked, generation displays a warning and does
  not produce an empty record.
- [ ] Counts of 1 and 10 generate exactly that many records.
- [ ] Counts of 0, 11, a decimal, or a blank value display a warning.
- [ ] In the browser developer console, check special-character handling in
  each supported format:

  ```js
  const sample = [
    {
      name: `O'Brien, "Sam"`,
      address: { street: '1 <Main> & "First"' },
    },
  ];
  [
    'json',
    'html',
    'javascript',
    'typescript',
    'python',
    'sql',
    'yaml',
    'text',
  ].forEach(format => {
    console.log(format, formatFakeData(sample, format));
  });
  ```

  Confirm that HTML escapes markup, SQL doubles apostrophes in string literals,
  and the Python output uses Python literals (`True`, `False`, and `None` for
  corresponding values). The JSON and JavaScript results should remain
  parseable as JSON/JavaScript.
- [ ] The theme toggle still works.

## Project files

- `index.html` — page structure and controls
- `styles.css` — layout, themes, and responsive styles
- `script.js` — data generation, output formatting, and notifications
- `assets/km-logo.jpeg` — app logo used in the navigation bar
