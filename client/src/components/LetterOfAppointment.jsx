import React, { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import axios from "axios";

const LetterOfAppointment = ({ dataFromExcel }) => {
  const contentRef = useRef();
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);

    const lettersToSend = [];

    for (let empIndex = 0; empIndex < dataFromExcel.length; empIndex++) {
      const employee = dataFromExcel[empIndex];

      // Find employee container
      const empElement = document.getElementById(`employee-${empIndex}`);
      if (!empElement) continue;

      const pdf = new jsPDF("p", "mm", "a4");
      const pageElements = empElement.querySelectorAll(".page");

      for (let i = 0; i < pageElements.length; i++) {
        const canvas = await html2canvas(pageElements[i], {
          scale: 1,
          useCORS: true,
        });
        const imgData = canvas.toDataURL("image/jpeg", 0.5);

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imgData);
        const imgRatio = imgProps.width / imgProps.height;
        const pageRatio = pdfWidth / pdfHeight;

        let renderWidth, renderHeight;
        if (imgRatio > pageRatio) {
          renderWidth = pdfWidth;
          renderHeight = pdfWidth / imgRatio;
        } else {
          renderHeight = pdfHeight;
          renderWidth = pdfHeight * imgRatio;
        }

        const marginX = (pdfWidth - renderWidth) / 2;
        const marginY = (pdfHeight - renderHeight) / 2;

        if (i > 0) pdf.addPage();
        pdf.addImage(
          imgData,
          "JPEG",
          marginX,
          marginY,
          renderWidth,
          renderHeight
        );
      }

      // Convert PDF to Base64
      const pdfBase64 = pdf.output("datauristring").split(",")[1];

      lettersToSend.push({
        pdfName: `${employee.name.replace(
          /\s+/g,
          "_"
        )}_Letter_Of_Appointment.pdf`,
        pdfBase64,
        email: employee.email, // make sure your Excel has an email field
      });
    }

    // Send all letters to backend
    try {
      const response = await axios.post(
        "http://localhost:5000/upload-letters",
        {
          letters: lettersToSend,
        }
      );

      console.log("Backend response:", response.data);
      alert("All letters sent successfully!");
    } catch (err) {
      console.error("Error sending letters:", err);
      alert("Failed to send letters. Check console for details.");
    }

    setLoading(false);
  };

  return dataFromExcel && dataFromExcel.length > 0 ? (
    <div className="flex flex-col items-center">
      {/* ✅ download button outside the map */}
      <button
        onClick={handleDownload}
        disabled={loading}
        className="mb-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Generating PDF..." : "Download PDF"}
      </button>

      {/* ✅ wrapper with ref contains all employees */}
      <div ref={contentRef} className="w-full">
        {dataFromExcel.map((item, index) => (
          <div
            key={index}
            id={`employee-${index}`} // ✅ unique container
            className="w-full h-full mt-10 flex flex-col p-7   "
          >
            <div ref={contentRef} className="">
              {/*================================= page-1 ==================================  */}
              <div className="page   p-5">
                {/* logo */}
                <div className="flex items-center justify-end">
                  <img
                    src="/beemaaa.png"
                    alt="beemaaa logo"
                    className="w-[250px] -m-10 -mt-20"
                  />
                </div>
                {/* name and address */}
                <div className="text-left">
                  <p>Name: {item.name}</p>
                  <p>Address: {item.address}</p>
                  <p className="mt-5">Dear {item.name} </p>
                </div>
                {/* heading */}
                <h2 className="text-center font-semibold text-2xl my-5">
                  Subject : Letter of Appointment
                </h2>

                {/* body container */}
                <div className="p-5">
                  <p>
                    We are pleased to appoint you as{" "}
                    <strong>{item.designation}</strong> in Grade{" "}
                    <strong>{item.grade}</strong> in M/S Spectrum Insurance
                    Broking (P) Ltd. and your employee code is.{" "}
                    <strong>{item.employeeCode}</strong> Your date of joining is{" "}
                    <strong>{item.date}</strong>, however, the entitlement of
                    salary would start from your official duty in the field and
                    validation of your attendance in the field. The terms &
                    conditions of your employment with our company are as
                    follows: <strong>POSTING & COMPENSATION</strong>
                  </p>
                  <ol className="list-decimal list-outside  mt-2 space-y-4">
                    <li>
                      Your initial posting will be in Delhi. However, you can
                      work from any of the Company's offices within or outside
                      the country subject to prior approval from competent
                      authority. The Company reserves the right to utilize your
                      services at any other place within or outside the country
                    </li>
                    <li>
                      The details of your Compensation Package are furnished in
                      the Annexure. In addition, you will be eligible for
                      performance -based Sales Incentive / Variable Pay as per
                      Company Policy.
                    </li>
                    <li>
                      The employee shall perform certain number of productive
                      activities on daily basis which should result into desired
                      business as per the goal sheet. Failing to achieve desired
                      daily activity will result into Absent/ Leave without Pay
                      (LWP) for the employee for that day. The company reserves
                      the right to take appropriate action/ terminate the
                      services of the employee if he/she is regularly failing to
                      perform the daily required activities along with the
                      desired business. Compensation will be governed by the
                      rules of the Company on the subject, as applicable and /
                      or amended hereafter.
                    </li>
                  </ol>
                  {/* Bold h4 heading as a list item */}
                  <h4 className="font-bold mt-4 list-none">PROBATION</h4>

                  <ol
                    start={4}
                    className="list-decimal list-outside  mt-2 space-y-4"
                  >
                    <li>
                      {" "}
                      You will be on probation for period of six (6) months from
                      the date of your joining. Upon successful completion of
                      the probation period and subsequent performance
                      evaluation, your position will be confirmed. Unless
                      confirmed in writing you will continue to be a
                      probationer.
                    </li>
                    <li>
                      {" "}
                      Based on your performance during the probation period the
                      company reserves the right to reduce/ dispense with or
                      extend the probationary period at its sole discretion or
                      terminate your services with immediate effect, without
                      giving any prior notice or assigning any reason there to
                      and without any notice or payment in lieu of notice.
                    </li>
                  </ol>

                  {/* Bold h4 heading as a list item */}
                  <h4 className="font-bold mt-4 list-none">
                    TRAINING AND INDUCTION
                  </h4>
                  <ol
                    start={6}
                    className="list-decimal list-outside  mt-2 space-y-4"
                  >
                    <li>
                      Notwithstanding anything contained herein, throughout the
                      course of your employment (during your induction,
                      probation and after confirmation of your employment), you
                      are required to compulsorily, and successfully complete
                      all the trainings and certifications as specified by the
                      Company within such time period as determined by the
                      Company from time to time, at its sole discretion, in
                      accordance with its processes and policies as amended from
                      time to time to the satisfaction of the Company.
                    </li>
                    <li>
                      In case you fail to successfully and satisfactorily
                      complete any or all of the trainings and certifications as
                      specified by the Company, the Company reserves the right
                      to take appropriate disciplinary action against you which
                      may include termination of your contract of employment.
                      Participation in the trainings and completion of
                      certification as specified by the Company is compulsory
                      and no employee shall have the right to reject or refuse
                      to attend any training or complete certification without
                      providing a legitimate reason acceptable to the Company
                    </li>
                  </ol>
                  {/* Bold h4 heading as a list item */}
                  <h4 className="font-bold mt-4 list-none">
                    ATTENDANCE & PAYMENT OF SALARY
                  </h4>
                  <ol
                    start={8}
                    className="list-decimal list-outside  mt-2 space-y-4"
                  >
                    <li>
                      The employee shall perform a certain number of productive
                      activities on a daily basis which should result in desired
                      business as per his goal sheet. Failing to achieve desired
                      daily activity will result in Absent / Leave Without Pay
                      (LWP) for the employee for that day. The company reserves
                      the right to take appropriate action/terminate the
                      services of the employee if the employee is regularly
                      failing to perform the daily required activities with the
                      desired business. Compensation will be governed by the
                      rules of the Company on the subject, as applicable and /
                      or amended here after. You will regularize your attendance
                      for your actual working days through the HR systems/tools
                      or such other modalities as prescribed by the Company with
                      due approval from your business head. The minimum daily
                      activity (Customer meetings/ FODs/ Quality Leads/
                      References etc.) will be as per your job role and will be
                      shared by your supervisor. The payment of monthly fixed
                      salary will be determined on the basis of achieving
                      required minimum daily activity and minimum expected Unit
                      (MEU).
                    </li>
                  </ol>
                  {/* Bold h4 heading as a list item */}
                  <h4 className="font-bold mt-4 list-none">
                    WHOLE TIME SERVICE / EMPLOYEMENT
                  </h4>
                  <ol
                    start={9}
                    className="list-decimal list-outside  mt-2 space-y-4"
                  >
                    <li>
                      The employee being in whole time service/ employment of
                      the Company, shall not or associate himself directly /
                      indirectly or in any other manner, whatsoever, in any
                      other post or work part time or pursue any course of study
                      without the prior permission of Company. The employee
                      shall devote his whole time, attention and skill to the
                      best of his ability for the expansion of the business of
                      the Company.
                    </li>
                    <li>
                      You will not directly or indirectly and neither solely nor
                      jointly be engaged in any other business or profession
                      whether it be during or after the hours of employment
                      without and shall refrain from engaging or being interest
                      directly or indirectly as the principal agent / partner
                      /director or employee in the production, sale or
                      advertisement of goods of any description or kind or
                      similar to or competitive with the products or services of
                      the company without the prior written consent of the
                      Company.
                    </li>
                    <li>
                      The employee shall work as required by the Company from
                      time to time without any extra payment. He may also be
                      required to attend duties on holidays / weekly off as per
                      exigencies of service.
                    </li>
                  </ol>
                </div>

                {/* footer */}
                <div className="flex flex-col mt-10 justify-center items-center">
                  {/* horizontal line */}
                  <hr
                    style={{
                      borderTop: "1px solid #4b5563",
                      width: "100%",
                      marginBottom: "8px",
                    }}
                  />

                  <p
                    style={{
                      fontSize: "20px",
                      fontWeight: "600",
                      textAlign: "center",
                      textTransform: "uppercase",
                      color: "#2563eb",
                    }}
                  >
                    Spectrum Insurance Broking (P) Ltd.
                  </p>
                  <p>
                    {" "}
                    5th Floor, Time House, Community Centre, Plot No. 5,
                    Wazirpur, WIA, Delhi 110052.
                  </p>
                  <p>
                    Ph: 011-47049019, Email: info@beemaaa.com (CIN:
                    U66000DL2021PTC380280), IRDAI Registration No. 809
                  </p>
                </div>
              </div>
              {/*=================================== page-2 ==================================== */}
              <div className=" page  p-5">
                {/* logo */}
                <div className="flex items-center justify-end">
                  <img
                    src="/beemaaa.png"
                    alt="beemaaa logo"
                    className="w-[250px] -m-10 -mt-20"
                  />
                </div>

                {/* body container */}
                <div className="p-5">
                  {/* Bold h4 heading as a list item */}
                  <h4 className="font-bold mt-4 list-none">DISCIPLINE</h4>
                  <ol
                    start={12}
                    className="list-decimal list-outside  mt-2 space-y-4"
                  >
                    <li>
                      You are bound to abide by and adhere to the policies,
                      rules and regulations enforced by the Company from time to
                      time including those relating to Code of Conduct,
                      Discipline, Benefits, Salary review, Retirement and any
                      other matter as though these rules and regulations are
                      subject to alteration and amendment from time to time. The
                      Code of Conduct here also includes Sales Code of Conduct
                      as specified by the regulator(s).
                    </li>
                  </ol>
                  {/* Bold h4 heading as a list item */}
                  <h4 className="font-bold mt-4 list-none">
                    SUPERVISION / CONTROL
                  </h4>
                  <ol
                    start={13}
                    className="list-decimal list-outside  mt-2 space-y-4"
                  >
                    <li>
                      The employee shall work under the supervision and control
                      of such persons as decided by the Company from time to
                      time. The employee shall most diligently and faithfully
                      carry out instructions or discharge his duties given to
                      him by his superiors or persons under whom he is placed to
                      work in the overall interest of the Company. The employee
                      shall take orders for sale of goods or services only
                      subject to confirmations and acceptance by the company and
                      on the usual terms and conditions. He shall not make any
                      representation in selling the goods or services or to give
                      any warranties or concessions other than as contained in
                      company’s conditions of sale.
                    </li>
                  </ol>
                  {/* Bold h4 heading as a list item */}
                  <h4 className="font-bold mt-4 list-none">
                    SECRECY & CONFIDENTIALITY
                  </h4>
                  <ol
                    start={14}
                    className="list-decimal list-outside  mt-2 space-y-4"
                  >
                    <li>
                      The employee shall always maintain high standard / degree
                      of secrecy and keep as confidential the recorded, data,
                      documents and such other information relating to the
                      business of Company which may be known to him or confided
                      in him by any means and shall upon relinquishment of his
                      services/ employment for any reason, return all such
                      record, data, document and other information to the
                      Company immediately if they are in his possession in any
                      manner and shall not attempt to retain copies of the any
                      data, records, known-how or information of the Company. In
                      case of any non-compliance to this requirement, the
                      company reserves the right to initiate legal proceedings
                      an /or claim suitable damages from the employee concerned.
                    </li>
                  </ol>
                  {/* Bold h4 heading as a list item */}
                  <h4 className="font-bold mt-4 list-none">COMPLIANCE</h4>
                  <ol
                    start={15}
                    className="list-decimal list-outside  mt-2 space-y-4"
                  >
                    <li>
                      The Employee / Service Provider shall Comply With all
                      Foreign, Federal, state and local laws, regulations, and
                      rulings of governmental bodies having jurisdiction.
                      Nothing is the Agreement shall be construed to require
                      sahipe.com to perform any act in violation of any laws,
                      guidelines, regulations, or rulings.
                    </li>
                    <li>
                      Based on your performance during the probation period the
                      company reserves the right to reduce/ dispense with or
                      extend the probationary period at its sole discretion or
                      terminate your services with immediate effect, without
                      giving any prior notice or assigning any reason there to
                      and without any notice or payment in lieu of notice.
                    </li>
                  </ol>
                  {/* Bold h4 heading as a list item */}
                  <li className="font-bold mt-4 list-none">
                    COMPANY'S PROPERTY
                  </li>
                  <ol
                    start={17}
                    className="list-decimal list-outside  mt-2 space-y-4"
                  >
                    <li>
                      The employee shall always maintain in good condition
                      Company’s property which may be given to him for official
                      use during the course of employment and shall return the
                      same to the Company immediately on relinquishment of his
                      services failing which the cost the same will be recovered
                      from him by the Company
                    </li>
                  </ol>
                  {/* Bold h4 heading as a list item */}
                  <h4 className="font-bold mt-4 list-none">TOUR & TRAVEL</h4>
                  <ol
                    start={18}
                    className="list-decimal list-outside  mt-2 space-y-4"
                  >
                    <li>
                      The employee is liable to travel with in or outside the
                      country as required by the Company from time to time.
                    </li>
                  </ol>
                  {/* Bold h4 heading as a list item */}
                  <h4 className="font-bold mt-4 list-none">
                    ADDITIONS / ALTERATIONS
                  </h4>
                  <ol
                    start={19}
                    className="list-decimal list-outside  mt-2 space-y-4"
                  >
                    <li>
                      The employee shall, in addition to the general service
                      Conditions as specifically stated herein above be governed
                      by other rules, regulations, practices, system, procedures
                      & policy which are in force or may be added, altered,
                      modified or omitted / delete by the Compa ny, Regulator or
                      the State from time to time.
                    </li>
                  </ol>
                  {/* Bold h4 heading as a list item */}
                  <h4 className="font-bold mt-4 list-none">RETIREMENT</h4>
                  <ol
                    start={20}
                    className="list-decimal list-outside  mt-2 space-y-4"
                  >
                    <li>
                      The employee shall automatically retire from the services
                      of the Company on his reaching the age of 60 Years (unless
                      the extension is granted by the Management) or earlier if
                      found medically unfit/ unsound for the job assigned to him
                      at sole discretion of Company
                    </li>
                  </ol>
                  {/* Bold h4 heading as a list item */}
                  <h4 className="font-bold mt-4 list-none">LEAVE</h4>
                  <ol
                    start={21}
                    className="list-decimal list-outside  mt-2 space-y-4"
                  >
                    <li>
                      You will be entitled to avail leave in accordance with the
                      rules of the Company
                    </li>
                    <li>
                      The company may ask the employee to leave the company due
                      to non-performance, non-achievement of minimum expected
                      business (MEB), increased instances of policy
                      cancellation, policy lapsation, poor quality of business
                      or lower business persistency. The company also reserves
                      the right of claw back and adjust the penalty in the
                      current or upcoming salary or incentive payout or in full
                      & final settlement.
                    </li>
                    <li>
                      The company may ask the employee to leave the company or
                      transfer to any other location in case of closure of
                      operations of any branch location or department due to any
                      unavoidable circumstances including pandemics, lock-downs,
                      natural calamities, curfews, state/central government
                      orders, terrorism activities, statutory requirements or
                      non-sustainability of operations due to any reasons
                      whatsoever. Alternatively, the company may ask the
                      employee to go on leave without pay in such or similar
                      unavoidable circumstances till further instructions.
                    </li>
                    <li>
                      In case you chose to resign from the Company, you will be
                      required to give sufficient notice. The notice period
                      shall be Three days in case of both employees on probation
                      and confirmed employees. The Company may, at its
                      discretion, require you to serve the entire notice period
                      or accept notice pay in lieu of notice.
                    </li>
                    <li>
                      In case notice pay (salary in lieu of notice) is payable
                      by the Company or the employee, it shall be calculated
                      solely on the basis of the basic salary as applicable, and
                      will not include the value of any allowances, benefits, or
                      perquisites due in terms of your appointment.
                    </li>
                    <li>
                      Your services can be terminated by the company, without
                      any notice or payment of any kind in lieu of notice, in
                      the following cases; <br></br> (a) Any incorrect
                      information furnished by you or on suppression of any
                      material information, like fake certificate, forged proof,
                      etc.
                      <br></br> (b) Any act, which in the opinion of the
                      management is an act of dishonesty, disobedience,
                      insubordination, incivility, threatening, intemperance,
                      irregularity in attendance or other misconduct or neglect
                      of duty or riotous behavior, incompetence in the discharge
                      of duty on your part or unsatisfactory performance or the
                      breach on your part of any of the terms, conditions or
                      stipulations contained in this agreement or a violation on
                      your part of any of the company’s rules.
                    </li>
                  </ol>
                </div>
              </div>
              {/*=================================== page-3 ===================================*/}
              <div className="page  p-5 ">
                {/* logo */}
                <div className="flex items-center justify-end">
                  <img
                    src="/beemaaa.png"
                    alt="beemaaa logo"
                    className="w-[250px] -m-10 -mt-20"
                  />
                </div>

                {/* body container */}
                <div className="p-5">
                  <ol
                    start={26}
                    className="list-decimal list-outside  mt-2 space-y-4"
                  >
                    <li className=" list-none">
                      (c) You being arrested by police for any offence and
                      remaining in custody. (d) Absence for continuous period of
                      5 days including absence when leave though applied for but
                      not granted in writing. (e) Written complaint by customer
                      regarding misbehavior, mislead more than once.
                    </li>

                    <li>
                      In case of your resignation or termination from the
                      services of Company, for any reasons whatsoever, the
                      admissibility or otherwise of payment of incentive and the
                      quantum of such incentive not to be paid and no
                      correspondence shall be entertained in this regard.
                    </li>

                    <li>
                      In the event of separation / termination, the employee
                      must return back all the Company’s property, ID Cards,
                      Visiting Cards, Customer data & Stationery handed over to
                      him at the time of joining / during the course of your
                      employment. The cost of such assets may be adjusted in his
                      full & final settlement, if these are not returned back to
                      the company at the time of exit. In case the employee
                      violating the said terms, the company may take legal
                      action against the employee.
                    </li>
                  </ol>
                  <ol
                    start={29}
                    className="list-decimal list-outside  mt-2 space-y-4"
                  >
                    {/* Bold h4 heading as a list item */}
                    <h4 className="font-bold mt-4 list-none">
                      RESTRICTION FOR REPRESENTING COMPANY AFTER
                      RELINQUISHMENTOF SERVICES
                    </h4>
                    <li>
                      The employee shall not anywhere at any time after
                      relinquishment of his services/employment either
                      personally or through his agents, friends or relatives
                      directly or indirectly himself as being connected or
                      interest in any way in the business of the Company. The
                      employee, in event of leaving the employment of the
                      company, shall not for a period of atleast 18 months from
                      the date of such relinquishment enter in to the business
                      identical to or competitive in nature to the business of
                      the company. In event of the employee violating the said
                      terms, the company shall be entitled to press criminal
                      charges for recovery of the entire business losses
                      suffered by them at present & in future as damage from the
                      employee acknowledges and accepts.
                    </li>
                  </ol>
                  {/* Bold h4 heading as a list item */}
                  <h4 className="font-bold mt-4 list-none">CLAWBACK POLICY</h4>
                  <ol
                    start={30}
                    className="list-decimal list-outside  mt-2 space-y-4"
                  >
                    <li>
                      As per the Company’s Incentive policy, any recoveries to
                      be made, amount due to the Company is to be recovered from
                      the employee before his leaving the Organization. In the
                      event Employee not paying his outstanding dues, the
                      Company has the right to take legal action as it deems fit
                      to recover its dues.
                    </li>

                    <li>
                      In the event the employee leaves the Company without any
                      notice, absconding or due to non-performance, the employee
                      is liable to pay an amount equivalent to six months of his
                      last drawn salary or equivalent to period of services
                      whichever in lower to the Company as damages which were
                      incurred by the Company towards imparting Training &
                      Orientation.
                    </li>
                  </ol>
                  {/* Bold h4 heading as a list item */}
                  <h4 className="font-bold mt-4 list-none">INDEMNITY</h4>
                  <ol
                    start={32}
                    className="list-decimal list-outside  mt-2 space-y-4"
                  >
                    <li>
                      The employee shall indemnify the company for the losses
                      caused to company due to any unlawful deeds & acts of the
                      employee. Such losses shall be recoverable from the
                      employee and/or his guarantors.
                    </li>

                    <li>
                      In addition to complying with rules, sales practices and
                      upon successful and satisfactory completion of training
                      and/or certification prescribed by the Company, you shall
                      be eligible to solicit life, Health, Motor insurance &
                      others financial products as allowed by the company from
                      time to time. You shall not authorize any person to act on
                      your behalf to solicit insurance business. Further, you
                      would disclose your identity to prospective/existing
                      customers and present your identity card to any customer,
                      when requested. Any violation of the clause in addition to
                      the other prescribed terms and policies of the Company
                      would attract appropriate disciplinary proceedings.
                    </li>
                  </ol>
                  {/* Bold h4 heading as a list item */}
                  <h4 className="font-bold mt-4 ">
                    PROFESSIONAL ETHICS AND CONDUCT
                  </h4>
                  <ol
                    start={34}
                    className="list-decimal list-outside  mt-2 space-y-4"
                  >
                    <li>
                      You shall not bind the Company against a third party, in
                      any manner whatsoever, thereby creating pecuniary or other
                      obligations, without prior authorization in writing. You
                      will exercise your best efforts to conserve the resources
                      of the Company and incur expenses judicially and within
                      the authorized limits.
                    </li>

                    <li>
                      Anti-Money Laundering: Money Laundering is moving
                      illegally acquired cash through financial systems so that
                      it appears to be legally acquired. All instances of Money
                      Laundering must be immediately reported to the Business
                      Head and Compliance Department at Head Office. All
                      employees and agents are required to be mandatory trained
                      on Anti-Money Laundering Policy.
                    </li>
                    <li>
                      Agent Relative Hiring: The policy guides hiring relatives
                      of employees (immediate/other relatives) as agents. The
                      policy sets out some guidelines for avoiding awkward and
                      potentially difficult work situations. In case a
                      non-permissible relationship gets established after an
                      agent is contracted, then the concerned employee(s)
                      contracting such agent and/or agents are required to
                      inform his/her supervisor/ branch head immediately.
                    </li>
                    <li>
                      You agree that you will not (nor will you cause or
                      cooperate with others to) publicly criticize, ridicule,
                      disparage or defame the Company or its products, services,
                      policies, directors, officers, shareholders or employees,
                      with or through any written or oral statement or image or
                      social media (including, but not limited to, any
                      statements made via websites, blogs, postings to the
                      internet or emails and whether or not they are made
                      anonymously or through the use of a pseudonym).
                    </li>
                    <li>
                      This Agreement shall be governed by and construed in
                      accordance with the laws of India. The courts located in
                      Delhi shall have exclusive jurisdiction over any disputes
                      arising from or related to this Agreement.
                    </li>
                  </ol>
                </div>
                <div className="mt-20 flex justify-between items-center">
                  <div>
                    <p>
                      Date: <strong>{item.date}</strong>
                    </p>
                    <p>Signature of employee</p>
                  </div>
                  <div className="flex items-baseline justify-baseline">
                    <p>Signature of HR Manager / Executive</p>
                  </div>
                </div>
                {/* footer */}
                <div className="flex flex-col mt-10 justify-center items-center">
                  {/* horizontal line */}
                  <hr
                    style={{
                      borderTop: "1px solid #4b5563",
                      width: "100%",
                      marginBottom: "8px",
                    }}
                  />

                  <p
                    style={{
                      fontSize: "20px",
                      fontWeight: "600",
                      textAlign: "center",
                      textTransform: "uppercase",
                      color: "#2563eb",
                    }}
                  >
                    Spectrum Insurance Broking (P) Ltd.
                  </p>
                  <p>
                    {" "}
                    5th Floor, Time House, Community Centre, Plot No. 5,
                    Wazirpur, WIA, Delhi 110052.
                  </p>
                  <p>
                    Ph: 011-47049019, Email: info@beemaaa.com (CIN:
                    U66000DL2021PTC380280), IRDAI Registration No. 809
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div className="p-4 text-center">
      <h2 className="text-2xl font-bold mb-4">No Data Available</h2>
      <p>Please upload an Excel file to generate the Letter of Appointment.</p>
    </div>
  );
};

export default LetterOfAppointment;
