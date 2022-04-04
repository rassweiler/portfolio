---
date: 2021-09-28T10:58:08-04:00
title: "Code Camp 1"
description: "Responsive Web Design"
featured_image: "/images/code-camp-1-bg.png"
tags: ["HTMl", "CSS", "Code","Camp"]
---

Part 1 of the Free Code Camp Campaign, all about responsive web design.

<!--more-->

___

## A) Tribute Page

### Stories

- User Story #1: My tribute page should have an element with a corresponding id="main", which contains all other elements.

- User Story #2: I should see an element with a corresponding id="title", which contains a string (i.e. text) that describes the subject of the tribute page (e.g. "Dr. Norman Borlaug").

- User Story #3: I should see either a figure or a div element with a corresponding id="img-div".

- User Story #4: Within the img-div element, I should see an img element with a corresponding id="image".

- User Story #5: Within the img-div element, I should see an element with a corresponding id="img-caption" that contains textual content describing the image shown in img-div.

- User Story #6: I should see an element with a corresponding id="tribute-info", which contains textual content describing the subject of the tribute page.

- User Story #7: I should see an a element with a corresponding id="tribute-link", which links to an outside site that contains additional information about the subject of the tribute page HINT: You must give your element an attribute of target and set it to \_blank in order for your link to open in a new tab (i.e. target="\_blank").

- User Story #8: The img element should responsively resize, relative to the width of its parent element, without exceeding its original size.

- User Story #9: The img element should be centered within its parent element.

### HTML Structure

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Kronk Tribute Page</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="Author" content="Kyle Rassweiler" />
    <link rel="stylesheet" type="text/css" href="style.css" />
  </head>
  <body>
    <main id="main">
      <h1 id="title">Kronk Tribute Page</h1>
      <figure id="img-div">
        <img
          id="image"
          src="https://static.wikia.nocookie.net/disney/images/6/64/Kronk_.jpg"
          alt="Kronk lookin Krunk"
        />
        <figcaption id="img-caption">Kronk lookin Krunk</figcaption>
      </figure>
      <section>
        <p id="tribute-info">Kronk is the coolest.</p>
        <a
          id="tribute-link"
          href="https://en.wikipedia.org/wiki/List_of_The_Emperor%27s_New_Groove_characters#Kronk"
          target="_blank"
        >
          View More Info About Kronk
        </a>
      </section>
    </main>
  </body>
</html>
```

### CSS Structure

```css
main {
  width: 100%;
  background-color: #c5c6d7;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

#title {
  width: 100%;
  font-weight: bold;
  text-align: center;
  background-color: #060606;
  color: #c9c9d9;
}

#img-div {
  justify-content: center;
  display: flex;
  flex-direction: column;
}

#image {
  max-width: 100%;
  height: auto;
  display: block;
}
```

___

## B) Survey Form

### Stories

- User Story #1: I can see a title with id="title" in H1 sized text.

- User Story #2: I can see a short explanation with id="description" in P sized text.

- User Story #3: I can see a form with id="survey-form".

- User Story #4: Inside the form element, I am required to enter my name in a field with id="name".

- User Story #5: Inside the form element, I am required to enter an email in a field with id="email".

- User Story #6: If I enter an email that is not formatted correctly, I will see an HTML5 validation error.

- User Story #7: Inside the form, I can enter a number in a field with id="number".

- User Story #8: If I enter non-numbers in the number input, I will see an HTML5 validation error.

- User Story #9: If I enter numbers outside the range of the number input, which are defined by the min and max attributes, I will see an HTML5 validation error.

- User Story #10: For the name, email, and number input fields inside the form I can see corresponding labels that describe the purpose of each field with the following ids: id="name-label", id="email-label", and id="number-label".

- User Story #11: For the name, email, and number input fields, I can see placeholder text that gives me a description or instructions for each field.

- User Story #12: Inside the form element, I can select an option from a dropdown that has a corresponding id="dropdown".

- User Story #13: Inside the form element, I can select a field from one or more groups of radio buttons. Each group should be grouped using the name attribute.

- User Story #14: Inside the form element, I can select several fields from a series of checkboxes, each of which must have a value attribute.

- User Story #15: Inside the form element, I am presented with a textarea at the end for additional comments.

- User Story #16: Inside the form element, I am presented with a button with id="submit" to submit all my inputs.

### HTML Structure

```html
<!DOCTYPE HTML>
<html lang="en">
	<head>oys
		<title>Kronk Tribute Page</title>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		<meta name="Author" content="Kyle Rassweiler">
		<link rel="stylesheet" type="text/css" href="style.css">
	</head>
	<body>
		<main id="main">
			<h1 id="title">Mein Supa Survey</h1>
			<p id="description">This be a survey what for asking questions</p>
			<form id="survey-form">
				<label id="name-label" for="name">Name</label>
				<input id="name" name="name" type="text" placeholder="Big Toys" required/>
				<label id="email-label" for="email">Email</label>
				<input id="email" name="email" type="email" placeholder="Biger@Toys.boys" required/>
				<label id="number-label" for="number">Numba</label>
				<input id="number" name="number" type="number" min="0" max="10" placeholder="9"/>
				<label id="dropdown-label" for="dropdown">Dropdown</label>
				<select id="dropdown" name="dropdown">
					<option value="Option1">Option 1</option>
					<option value="Option2">Option 2</option>
				</select>
				<fieldset>
					<legend>
						Biggest Boy
					</legend>
					<input id="number" name="biggest_boy" type="radio" value="Jung-li">Jung Li</input>
					<input id="number" name="biggest_boy" type="radio" value="Jeff">Jeff SingleBridge</input>
				</fieldset>
				<label id="apple-label" for="apple">Apples?</label>
				<input id="apple" name="apple" type="checkbox" value="apples"/>
				<label id="cheese-label" for="cheese">Cheese?</label>
				<input id="cheese" name="cheese" type="checkbox" value="cheese"/>
				<label id="texto-label" for="texto">Commento</label>
				<textarea id="texto" name="texto" placeholder="Comments ?"></textarea>
				<input id="submit" type="submit">
			</form>
		</main>
	</body>
</html>
```

### CSS Structure

```css
main {
	width: 50rem;
	background-color: #c5c6d7;
	text-align: center;
}

#survey-form {
	display: flex;
	flex-direction:column;
	padding: 1rem;
}
```

___