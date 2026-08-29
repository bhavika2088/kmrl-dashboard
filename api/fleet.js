
/*
  TRACKX backend endpoint

  This serverless function provides the fleet dataset to the
  React dashboard.

  KMRL train identities are public information.
  Operational fields are DEMONSTRATION DATA and are clearly
  labelled as such in the frontend.
*/

const trainNames = [
  "KRISHNA",
  "TAPTI",
  "NILA",
  "SARAYU",
  "ARUTH",
  "VAIGAI",
  "JHANAVI",
  "DHWANIL",
  "BHAVANI",
  "PADMA",
  "MANDAKINI",
  "YAMUNA",
  "PERIYAR",
  "KABANI",
  "VAAYU",
  "KAVERI",
  "SHIRIYA",
  "PAMPA",
  "NARMADA",
  "MAHE",
  "MAARUT",
  "SABARMATHI",
  "GODHAVARI",
  "GANGA",
  "PAVAN",
];

export default function handler(req, res) {
  const trains = trainNames.map((name, index) => ({
    id: `KMRL-${String(index + 1).padStart(2, "0")}`,
    name,

    // Demonstration operational fields
    fitness:
      index === 7 || index === 18
        ? "Review"
        : "Valid",

    mileage:
      28000 + ((index * 1377) % 29000),

    branding:
      index % 5 === 0
        ? "High"
        : index % 3 === 0
        ? "Medium"
        : "Low",

    maintenance:
      index === 5 ||
      index === 14 ||
      index === 21
        ? "Due"
        : index === 9 ||
          index === 17
        ? "Scheduled"
        : "Clear",
  }));

  res.status(200).json({
    source: "TRACKX demonstration API",
    officialReference:
      "KMRL public fleet information",
    dataType:
      "Public train identities + simulated operational fields",
    updatedAt: new Date().toISOString(),
    trains,
  });
}
