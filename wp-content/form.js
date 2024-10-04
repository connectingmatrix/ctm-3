const REQUEST_A_FREE_QUOTE_FORM = "242762967392066";
const RECRUITMENT_FORM = "242771320824049";

const getFormQuestions = async (formId) => {
  let response;
  try {
    response = await axios.get(
      "https://api.jotform.com/form/" +
        formId +
        "/questions?apiKey=df1f94ca96ff06e7b30c6adf23b8cb10"
    );
  } catch (error) {
    return error;
  }
  return response;
};

const getFormData = async (type) => {
  let formId;
  if (type === "request-a-free-quote-form") {
    formId = REQUEST_A_FREE_QUOTE_FORM;
  } else if (type === "recruitment-form") {
    formId = RECRUITMENT_FORM;
  }
  const response = await getFormQuestions(formId);
  if (response && response.data && response.data.content) {
    const formattedData = Object.keys(response.data.content)
      .map((key) => {
        const item = response.data.content[key];
        return (
          item.qid &&
          (item.type.split("_").pop() || "") !== "button" && {
            key: item.name || "",
            id: item.qid,
            name: item.name,
            options: item.options ? item.options.split("|") : [],
            question: item.text,
            subHeader: item.subHeader,
            type: item.type ? item.type.split("_").pop() : "",
          }
        );
      })
      .filter(Boolean)
      .sort((a, b) => Number(a.key) - Number(b.key));
    return {
      success: true,
      data: formattedData,
    };
  } else {
    return {
      success: false,
      data: null,
    };
  }
};

const populateForm = (formData, type) => {
  const form = document.getElementById(type);
  formData.forEach((field) => {
    const formGroup = document.createElement("div");
    formGroup.className = "form-group";

    const label = document.createElement("label");
    label.htmlFor = field.id;
    label.innerText = field.question;
    formGroup.appendChild(label);

    let input;
    if (field.type === "dropdown" && field.options.length > 0) {
      input = document.createElement("select");
      input.id = field.id;
      input.name = field.id;
      input.required = true;
      const defaultOpt = document.createElement("option");
      defaultOpt.value = "none";
      defaultOpt.innerText = "Please Select Option";
      defaultOpt.selected = true;
      defaultOpt.disabled = true;
      input.appendChild(defaultOpt);
      field.options.forEach((option) => {
        const opt = document.createElement("option");
        opt.value = option;
        opt.innerText = option;
        input.appendChild(opt);
      });
      formGroup.appendChild(input);
    } else if (field.type === "text") {
      input = document.createElement("input");
      input.type = "text";
      input.id = field.id;
      input.name = field.id;
      input.required = true;
      formGroup.appendChild(input);
    } else if (field.type === "email") {
      input = document.createElement("input");
      input.type = "email";
      input.id = field.id;
      input.name = field.id;
      input.required = true;
      formGroup.appendChild(input);
    } else if (field.type === "textarea") {
      input = document.createElement("textarea");
      input.type = "textarea";
      input.id = field.id;
      input.name = field.id;
      input.rows = 10;
      input.required = true;
      formGroup.appendChild(input);
    } else if (field.type === "fileupload") {
      input = document.createElement("input");
      input.type = "file";
      input.id = field.id;
      input.name = field.id;
      input.required = true;
      input.accept = ".pdf, .doc, .docx";
      let allowed = document.createElement("small");
      (allowed.innerHTML = "Allowed Type(s): .pdf, .doc, .docx"),
        formGroup.appendChild(input);
      formGroup.appendChild(allowed);
    } else if (field.type === "checkbox") {
      input = document.createElement("input");
      input.type = "checkbox";
      input.id = field.id;
      input.name = field.id;
      input.required = true;
      formGroup.appendChild(input);
    } else if (field.type === "radio") {
      const radioGroup = document.createElement("div");
      radioGroup.className = "radio-group";

      field.options.forEach((option) => {
        const radioWrapper = document.createElement("div");

        const radioInput = document.createElement("input");
        radioInput.type = "radio";
        radioInput.id = `${field.id}-${option}`;
        radioInput.name = field.id;
        radioInput.value = option;

        const radioLabel = document.createElement("label");
        radioLabel.htmlFor = radioInput.id;
        radioLabel.innerText = option;

        radioWrapper.appendChild(radioInput);
        radioWrapper.appendChild(radioLabel);

        radioGroup.appendChild(radioWrapper);
      });

      formGroup.appendChild(radioGroup);
    } else {
      input = document.createElement("input");
      input.type = "text";
      input.id = field.id;
      input.name = field.id;
      input.required = true;
      formGroup.appendChild(input);
    }

    form.appendChild(formGroup);
  });
  const submitButton = document.createElement("input");
  submitButton.type = "submit";
  submitButton.value = "Submit";
  submitButton.className = "submit-button";
  form.appendChild(submitButton);
};

const sendFormData = async (type) => {
  let formId;
  if (type === "request-a-free-quote-form") {
    formId = REQUEST_A_FREE_QUOTE_FORM;
  } else if (type === "recruitment-form") {
    formId = RECRUITMENT_FORM;
  }
  const form = document.getElementById(type);
  const formData = new FormData(form);
  let data = {};
  for (const [key, value] of formData.entries()) {
    data[key] = value;
  }

  let response;

  try {
    response = await axios.post(
      "https://api.jotform.com/form/" +
        formId +
        "/submissions?apiKey=df1f94ca96ff06e7b30c6adf23b8cb10",
      data
    );
    form.reset();
  } catch (error) {
    console.error("Error submitting form:", error);
  }
};

const loadRequestAQouteForm = async () => {
  const formData = await getFormData("request-a-free-quote-form");
  if (formData.success) {
    populateForm(formData.data, "request-a-free-quote-form");
  } else {
    console.error("Failed to load form data");
  }
};

const loadRecruitmentForm = async () => {
  const formData = await getFormData("recruitment-form");
  if (formData.success) {
    populateForm(formData.data, "recruitment-form");
  } else {
    console.error("Failed to load form data");
  }
};
