module.exports.validateRegisterInput = (username, email, password, confirmPassword) => {
  const errors = {};
  if (username.trim() === "") {
    errors.username = "Username required";
  } else if (username.length < 4) {
    errors.username = "Username must be greater than 3 characters";
  } else if (username.length > 16) {
    errors.username = "Username must be less than 17 characters";
  } else {
    const regEx = /^(?=[a-zA-Z0-9._]{4,16}$)(?!.*[_.]{2})[^_.].*[^_.]$/;
    if (!username.match(regEx)) {
      errors.username = "Invalid username";
    }
  }
  if (email.trim() === "") {
    errors.email = "Email must not be empty";
  } else {
    const regEx = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
    if (!email.match(regEx)) {
      errors.email = "Must be an email address";
    }
  }

  if (password.trim() === "") {
    errors.password = "Password must not be empty";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords must match";
  } else {
    const regEx = /^(?=.{8,})(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).*$/;
    if (!password.match(regEx)) {
      errors.password = "8 characters, one lowercase, one uppercase, and one special character";
    }
  }
  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.validateLoginInput = (email, password) => {
  const errors = {};
  if (email.trim() === "") {
    errors.email = "Email must not be empty";
  }
  if (password.trim() === "") {
    errors.password = "Password must not be empty";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.validateCharacterInput = (charName) => {
  const errors = {};
  if (charName.trim() === "") {
    errors.charName = "Name must not be empty";
  } else if (charName.length > 20) {
    errors.charName = "Name must not be greater than 20 characters";
  } else {
    const regEx = /^[a-z ,.'-]+$/i;
    if (!charName.match(regEx)) {
      errors.charName = "Invalid name";
    }
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.check = (target) => {
  if (
    target === "head" ||
    target === "upperBody" ||
    target === "lowerBody" ||
    target === "feet" ||
    target === "leftHand" ||
    target === "rightHand" ||
    target === "ringOne" ||
    target === "ringTwo"
  ) {
    return 2;
  } else if (target.substring(0, 4) === "slot") {
    return 1;
  } else {
    return 0;
  }
};
