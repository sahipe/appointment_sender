export default function CompensationSheet({
  name,
  joiningDate,
  designation,
  grossSalary,
}) {
  // Convert gross salary into numbers
  const grossMonthly = Number(grossSalary);
  const grossAnnual = grossMonthly * 12;
  const basicMonthly = grossMonthly * 0.5;

  // Calculate PF
  const companyPfContributionMonthly =
    basicMonthly < 15000 ? basicMonthly * 0.12 : 1800;
  const employeePfContributionMonthly =
    basicMonthly < 15000 ? basicMonthly * 0.12 : 1800;

  //calculate ESIC
  const esicCompanyContributionMonthly =
    grossMonthly <= 21000 ? grossMonthly * 0.0175 : 0;
  const esicEmployeeContributionMonthly =
    grossMonthly <= 21000 ? grossMonthly * 0.0075 : 0;

  ///////// Gratuity/////
  const gratuityMonthly = basicMonthly * 0.0481;
  const gratuityAnnual = gratuityMonthly * 12;

  //ghi
  const GHI = 0;

  //BQP allowance
  const BQP = 0;

  //bonus calculation
  const bonusMonthly =
    (grossMonthly +
      esicCompanyContributionMonthly +
      companyPfContributionMonthly +
      BQP +
      gratuityMonthly) *
    0.1;

  // Base components (without "Special Allowances")
  const baseComponents = [
    { label: "Basic Salary", monthly: grossMonthly * 0.5 },
    { label: "HRA", monthly: grossMonthly * 0.25 },
    { label: "Conveyance", monthly: 1740 },
    { label: "Entertainment Allowances", monthly: 1740 },
  ];

  // Calculate total allocated so far
  const allocated = baseComponents.reduce((sum, c) => sum + c.monthly, 0);

  // Special Allowances = Gross - sum of others
  const specialAllowance = grossMonthly - allocated;

  // Build final salary components list
  const salaryComponents = [
    ...baseComponents,
    { label: "Special Allowances", monthly: specialAllowance },
    { label: "Gross Salary", monthly: grossMonthly, highlight: true },
    {
      label: "PF (Company Contribution)",
      monthly: companyPfContributionMonthly,
    },
    {
      label: "ESIC (Company Contribution)",
      monthly: esicCompanyContributionMonthly,
    },
    { label: "BQP Allowance#", monthly: BQP, highlight: true },
    { label: "Gratuity", monthly: basicMonthly * 0.0481 },
    { label: "GHI##", monthly: GHI <= 0 ? 0 : GHI, highlight: true },
    { label: "Bonus ###", monthly: bonusMonthly, highlight: true },
    {
      label: "CTC",
      monthly:
        grossMonthly +
        grossMonthly * 0.052 +
        grossMonthly * 0.024 +
        grossMonthly * 0.108,
      highlight: true,
    },
    {
      label: "PF (Employee Contribution)",
      monthly: employeePfContributionMonthly,
    },
    {
      label: "ESIC (Employee Contribution)",
      monthly: esicEmployeeContributionMonthly,
    },
    {
      label: "Net Salary in Hand",
      monthly:
        grossMonthly -
        employeePfContributionMonthly -
        esicEmployeeContributionMonthly,
      highlight: true,
    },
  ];

  // Add annual values (rounded)
  // Add annual values (rounded)
  salaryComponents.forEach((c) => {
    c.monthly = Math.round(c.monthly ?? 0);
    c.annual = Math.round((c.monthly ?? 0) * 12);
  });

  const employee = {
    Name: name,
    "Date of joining": joiningDate,
    Designation: designation,
  };

  const notes = [
    "NOTES:-",
    "# BQP Allowance (Broker Qualified Person Allowance) : It is payable subject to successfully completing the required IRDAI training & passing the BQP exam as specified by the regulator (IRDAI). The decision of management will be final.",
    "## GHI (Group Health Policy) & GPA (Group Personal Accident) : GHI&GPA will be applicable only after confirmation of service",
    "### Bonus is payable subject to the achievement of assigned goals sheet at the end of FY, in 12 monthly instalments. If the employee has joined in the mid of FY then it will be paid on pro-rata basis subject to the achievement of his/her goal sheet in the given period. The decision of management/ HO will be final.",
    "IMPORTANT: Please note that the salary (applicable for all sales roles) for any month will accrue in proportion to the percentage achievement of your goal sheet for that month. Also, for all sales roles, the daily attendance will be subject to completing minimum required daily field input activity and reporting the same to your Manager and HO on daily basis.",
  ];

  return (
    <div
      style={{
        maxWidth: "64rem",
        margin: "0 auto",
        padding: "1.5rem",
        backgroundColor: "white",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        borderRadius: "1rem",
        fontSize: "0.95rem",
        overflowX: "auto",
      }}
    >
      <div
        style={{
          minWidth: "100%",
          display: "inline-block",
          verticalAlign: "middle",
        }}
      >
        <table
          style={{
            minWidth: "100%",
            border: "1px solid black",
            textAlign: "left",
            borderCollapse: "collapse",
          }}
        >
          <tbody>
            {/* Header */}
            <tr>
              <td
                colSpan="3"
                style={{
                  textAlign: "center",
                  fontSize: "1.125rem",
                  fontWeight: "bold",
                  padding: "0.5rem",
                  borderBottom: "1px solid black",
                }}
              >
                ANNEXURE (A)
              </td>
            </tr>
            <tr>
              <td
                colSpan="3"
                style={{
                  textAlign: "center",
                  fontWeight: "600",
                  padding: "0.5rem",
                  backgroundColor: "#f3f4f6",
                }}
              >
                Compensation Break-up Sheet (Strictly Confidential)
              </td>
            </tr>

            {/* Employee Info */}
            {Object.entries(employee).map(([key, value], idx) => (
              <tr key={idx}>
                <td
                  style={{
                    border: "1px solid black",
                    padding: "0.4rem 0.75rem",
                    fontWeight: "600",
                    width: "33%",
                  }}
                >
                  {key}
                </td>
                <td
                  colSpan="2"
                  style={{
                    border: "1px solid black",
                    padding: "0.4rem 0.75rem",
                    textAlign: "center",
                  }}
                >
                  {value}
                </td>
              </tr>
            ))}

            {/* Salary Table Header */}
            <tr>
              <td
                style={{
                  border: "1px solid black",
                  padding: "0.5rem 0.75rem",
                  backgroundColor: "#f3f4f6",
                  fontWeight: "bold",
                }}
              >
                Salary Component
              </td>
              <td
                style={{
                  border: "1px solid black",
                  padding: "0.5rem 0.75rem",
                  textAlign: "center",
                  backgroundColor: "#f3f4f6",
                  fontWeight: "bold",
                }}
              >
                Monthly
              </td>
              <td
                style={{
                  border: "1px solid black",
                  padding: "0.5rem 0.75rem",
                  textAlign: "center",
                  backgroundColor: "#f3f4f6",
                  fontWeight: "bold",
                }}
              >
                Annual
              </td>
            </tr>

            {/* Salary Components */}
            {salaryComponents.map((item, idx) => (
              <tr
                key={idx}
                style={{
                  backgroundColor: item.highlight ? "#f3f4f6" : "white",
                  fontWeight: item.highlight ? "bold" : "normal",
                }}
              >
                <td
                  style={{
                    border: "1px solid black",
                    padding: "0.4rem 0.75rem",
                  }}
                >
                  {item.label}
                </td>
                <td
                  style={{
                    border: "1px solid black",
                    padding: "0.4rem 0.75rem",
                    textAlign: "center",
                  }}
                >
                  {item.monthly}
                </td>
                <td
                  style={{
                    border: "1px solid black",
                    padding: "0.4rem 0.75rem",
                    textAlign: "center",
                  }}
                >
                  {item.annual}
                </td>
              </tr>
            ))}

            {/* Notes */}
            {notes.map((note, idx) => (
              <tr key={idx}>
                <td
                  colSpan="3"
                  style={{
                    padding: "0.25rem 0.75rem",
                    fontWeight: "bold",
                    color: note.startsWith("IMPORTANT") ? "black" : "inherit",
                  }}
                >
                  {note}
                </td>
              </tr>
            ))}

            {/* Footer */}
            <tr>
              <td
                colSpan="3"
                style={{
                  textAlign: "center",
                  color: "black",
                  borderTop: "1px solid black",
                  padding: "1rem 0",
                }}
              >
                This is Computer Generated Annexure and does not require
                signatures.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
