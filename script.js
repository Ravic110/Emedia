a = parseInt(prompt("entrer la valeur de A"));
b = parseInt(prompt("entrer la valeur de B"));
c = parseInt(prompt("entrer la valeur de C"));
console.log("f(x) = " + a + "x^2 + " + b + "x + " + c + " = 0");

discriminant = b*b - 4*a*c;
recineDiscriminant = Math.sqrt(discriminant);

if (discriminant > 0) {
    console.log("le discriminant est strictement positif");
    x1 = (-b - recineDiscriminant) / (2*a);
    x2 = (-b + recineDiscriminant) / (2*a);
    console.log("les solutions sont x1 = " + x1 + " et x2 = " + x2);
} else if (discriminant == 0) {
    console.log("le discriminant est nul");
    x = -b / (2*a);
    console.log("la solution est x = " + x);
} else {
    console.log("le discriminant est strictement negatif");
}