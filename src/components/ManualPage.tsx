export default function ManualPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-surface-900">How to Use CDQA</h2>
        <p className="text-sm text-surface-500 mt-0.5">Step-by-step guide for all features</p>
      </div>

      {/* Roles Explorer */}
      <div className="bg-white border border-surface-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-brand-50 to-white border-b border-surface-200">
          <h3 className="text-sm font-bold text-brand-800">🎯 Roles Explorer</h3>
        </div>
        <div className="p-4 text-sm text-surface-600 space-y-2">
          <p className="font-medium text-surface-700">Browse and copy job titles by sector, department, and level.</p>
          <ol className="list-decimal ml-5 space-y-1.5">
            <li>Go to the <strong>Roles</strong> tab</li>
            <li>Select a <strong>Sector</strong> from the dropdown (e.g., Manufacturing, Technology, Healthcare)</li>
            <li>The sub-industries list and department keyword reference will appear</li>
            <li>Browse <strong>Major Roles</strong> — Department × Level cross-product (e.g., Sales × Manager = Sales Manager)</li>
            <li>Browse <strong>Minor Roles</strong> — additional designations that don't follow the strict pattern</li>
            <li>Use the <strong>Filter by Level</strong> buttons to narrow by seniority (C-Level, VP, Director, Manager, Staff)</li>
            <li>Toggle <strong>5C Blacklist</strong> keywords to exclude unwanted titles from view</li>
            <li>Click <strong>Copy All</strong> on any department card to copy all its titles to clipboard at once</li>
            <li>Use the <strong>Title Validation</strong> tool at the bottom to classify any job title by department, level, and blacklist status</li>
          </ol>
          <div className="mt-2 p-2.5 bg-brand-50 border border-brand-200 rounded-lg text-xs text-brand-700">
            <span className="font-bold">💡 Use case:</span> Find all Manager-level titles in Sales across Manufacturing, copy them, and paste into LinkedIn search or the Dork Generator.
          </div>
        </div>
      </div>

      {/* Profile Validation */}
      <div className="bg-white border border-surface-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-white border-b border-surface-200">
          <h3 className="text-sm font-bold text-emerald-800">✅ Profile Validation</h3>
        </div>
        <div className="p-4 text-sm text-surface-600 space-y-2">
          <p className="font-medium text-surface-700">Upload LinkedIn profile PDFs and validate them against your targeting spec.</p>
          <ol className="list-decimal ml-5 space-y-1.5">
            <li>Go to the <strong>Specs</strong> tab</li>
            <li>Click <strong>Create Spec</strong> and configure:
              <ul className="list-disc ml-5 mt-1 space-y-0.5 text-xs text-surface-500">
                <li><strong>Target Title:</strong> minimum level required (e.g., Manager+)</li>
                <li><strong>Industry:</strong> sector you're targeting</li>
                <li><strong>Geography:</strong> APAC, EMEA, or LATAM + specific countries</li>
                <li><strong>Company Size:</strong> min/max employee range</li>
              </ul>
            </li>
            <li>Select the spec — you'll be taken to the <strong>Validate</strong> tab</li>
            <li>Upload LinkedIn profile <strong>PDFs</strong> (drag & drop or click to browse)</li>
            <li>Wait for automatic extraction — the engine parses: name, job title, company, location, tenure, "Present" status</li>
            <li>Review the extracted fields in the editing panel — fix any misparsed values manually</li>
            <li>Click <strong>Validate Against Spec</strong> — the engine checks:
              <ul className="list-disc ml-5 mt-1 space-y-0.5 text-xs text-surface-500">
                <li>Title level matches spec (e.g., Manager+ includes Manager, Director, VP)</li>
                <li>Department is identified (HR, IT, Sales, Marketing, Finance, Admin, Facilities)</li>
                <li>Title is not blacklisted (Support, Specialist, Intern, Contractor, etc.)</li>
                <li>Location matches spec countries</li>
                <li>Tenure is within threshold (default: ≤5 years in current role)</li>
                <li>Profile is active (has "Present" in current role)</li>
                <li>Not dual-employed</li>
              </ul>
            </li>
            <li>Go to the <strong>Results</strong> tab to see pass/fail/flag per rule, overall status, and flags</li>
          </ol>
          <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700">
            <span className="font-bold">💡 Use case:</span> Validate 50 Manufacturing Sales Manager PDFs from Germany against a spec — instantly see which ones pass title, geo, and tenure checks.
          </div>
        </div>
      </div>

      {/* Google Dork Generator */}
      <div className="bg-white border border-surface-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-amber-50 to-white border-b border-surface-200">
          <h3 className="text-sm font-bold text-amber-800">🔍 Google Dork Generator</h3>
        </div>
        <div className="p-4 text-sm text-surface-600 space-y-2">
          <p className="font-medium text-surface-700">Build a Google search string to find LinkedIn profiles matching your criteria.</p>
          <ol className="list-decimal ml-5 space-y-1.5">
            <li>Go to the <strong>Dork</strong> tab</li>
            <li>Fill in <strong>Targeting Criteria</strong>:
              <ul className="list-disc ml-5 mt-1 space-y-0.5 text-xs text-surface-500">
                <li><strong>Industry:</strong> select from 10 sectors (Manufacturing, Technology, Healthcare, etc.)</li>
                <li><strong>Location:</strong> free text (e.g., "Germany", "United Kingdom", "APAC")</li>
                <li><strong>Company size:</strong> min/max range</li>
              </ul>
            </li>
            <li>Check the <strong>Management Level(s)</strong> you want:
              <ul className="list-disc ml-5 mt-1 space-y-0.5 text-xs text-surface-500">
                <li>C-Level: CEO, CFO, CTO, President, Founder...</li>
                <li>Vice President: VP, SVP, EVP, AVP, Head of...</li>
                <li>Director/Head: Director, Senior Director, Group Director...</li>
                <li>Manager: Manager, Senior Manager, Team Lead, Supervisor...</li>
                <li>Staff: Executive, Specialist, Analyst, Engineer (IT only)...</li>
              </ul>
            </li>
            <li>Configure <strong>Profile Filters</strong>:
              <ul className="list-disc ml-5 mt-1 space-y-0.5 text-xs text-surface-500">
                <li><strong>Max tenure:</strong> exclude profiles with longer current role tenure (default: 5yr)</li>
                <li><strong>Employment type:</strong> Full-time, Part-time, Contract, Freelance, Self-employed</li>
                <li><strong>Location type:</strong> On-site, Hybrid, Remote</li>
                <li><strong>"Present":</strong> toggle to require current role has "Present" date</li>
              </ul>
            </li>
            <li>Toggle <strong>Exclusion Keywords</strong> to filter out unwanted titles (Support, Intern, Contractor, etc.)</li>
            <li>Review the generated dork in <strong>Section View</strong> — each part is shown separately with labels</li>
            <li>Click <strong>Copy Full Dork</strong> or click the link to open Google search directly</li>
          </ol>
          <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 space-y-1">
            <p><span className="font-bold">💡 Tip 1:</span> Start with one industry + one level. Add more OR terms only if results are too few.</p>
            <p><span className="font-bold">💡 Tip 2:</span> The dork uses <code className="text-[11px] font-mono bg-amber-100 px-1 rounded">site:linkedin.com/in</code> to restrict results to LinkedIn profiles. Google's OR logic handles title alternatives.</p>
            <p><span className="font-bold">💡 Tip 3:</span> Profile filter terms (Full-time, On-site, etc.) are NOT added to the dork — they're too generic and pollute results. Use them mentally or apply them on LinkedIn directly.</p>
          </div>
        </div>
      </div>

      {/* Quick Reference */}
      <div className="bg-white border border-surface-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-surface-50 to-white border-b border-surface-200">
          <h3 className="text-sm font-bold text-surface-800">⚡ Keyboard Shortcuts & Tips</h3>
        </div>
        <div className="p-4 text-sm text-surface-600">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-surface-200">
                <th className="text-left py-1.5 pr-4 font-semibold text-surface-700">Action</th>
                <th className="text-left py-1.5 font-semibold text-surface-700">How</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              <tr><td className="py-1.5 pr-4">Copy all roles in a department</td><td className="py-1.5">Click <strong>Copy All</strong> on the department card in Roles tab</td></tr>
              <tr><td className="py-1.5 pr-4">Quick-validate a title</td><td className="py-1.5">Use the Title Validation tool at the bottom of the Roles tab</td></tr>
              <tr><td className="py-1.5 pr-4">Batch validate all profiles</td><td className="py-1.5">Click <strong>Validate All</strong> in the Validate tab header</td></tr>
              <tr><td className="py-1.5 pr-4">Copy generated dork</td><td className="py-1.5">Click <strong>Copy Full Dork</strong> in the Dork tab output</td></tr>
              <tr><td className="py-1.5 pr-4">Open dork in Google</td><td className="py-1.5">Click the dork link in the Dork tab output</td></tr>
              <tr><td className="py-1.5 pr-4">Reset exclusion defaults</td><td className="py-1.5">Click <strong>Reset</strong> in the exclusion list panel</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
