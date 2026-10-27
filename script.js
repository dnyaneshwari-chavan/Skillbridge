let skills = JSON.parse(
    localStorage.getItem("skills") || "[]"
);

let certificates = JSON.parse(
    localStorage.getItem("certificates") || "[]"
);

function addSkill() {
    const input = document.getElementById("skillInput");
    const name = input.value.trim();

    if (name === "") {
        alert("Please enter a skill name");
        return;
    }

    skills.push(name);

    localStorage.setItem(
        "skills",
        JSON.stringify(skills)
    );

    input.value = "";
    displaySkills();
}

function addCertificate() {
    const input = document.getElementById("certificateInput");
    const name = input.value.trim();

    if (name === "") {
        alert("Please enter a certificate name");
        return;
    }

    certificates.push(name);

    localStorage.setItem(
        "certificates",
        JSON.stringify(certificates)
    );

    input.value = "";
    displayCertificates();
}

function displaySkills() {
    const list = document.getElementById("skillList");
    list.innerHTML = "";

    skills.forEach((skill, index) => {
        const li = document.createElement("li");
        const text = document.createElement("span");
        const button = document.createElement("button");

        text.textContent = skill;
        button.textContent = "Delete";

        button.onclick = () => {
            skills.splice(index, 1);
            localStorage.setItem(
                "skills",
                JSON.stringify(skills)
            );
            displaySkills();
        };

        li.append(text, button);
        list.appendChild(li);
    });

    document.getElementById("totalSkills").textContent =
        skills.length;
}

function displayCertificates() {
    const list = document.getElementById("certificateList");
    list.innerHTML = "";

    certificates.forEach((certificate, index) => {
        const li = document.createElement("li");
        const text = document.createElement("span");
        const button = document.createElement("button");

        text.textContent = certificate;
        button.textContent = "Delete";

        button.onclick = () => {
            certificates.splice(index, 1);
            localStorage.setItem(
                "certificates",
                JSON.stringify(certificates)
            );
            displayCertificates();
        };

        li.append(text, button);
        list.appendChild(li);
    });

    document.getElementById("totalCertificates").textContent =
        certificates.length;
}

displaySkills();
displayCertificates();