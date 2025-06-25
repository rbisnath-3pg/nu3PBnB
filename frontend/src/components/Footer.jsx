import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: '' });

  const handleLinkClick = (e, title, content) => {
    e.preventDefault();
    setModalContent({ title, content });
    setShowModal(true);
  };

  const footerSections = {
    support: {
      title: t('footer.support'),
      links: [
        {
          text: t('footer.helpCenter'),
          title: 'Help Center',
          content: `
            <h2 class="text-2xl font-bold mb-4">Help Center</h2>
            <div class="space-y-6">
              <div>
                <h3 class="text-lg font-semibold mb-2">Getting Started</h3>
                <ul class="list-disc list-inside space-y-1 text-gray-600">
                  <li>How to create an account</li>
                  <li>Booking your first stay</li>
                  <li>Understanding cancellation policies</li>
                  <li>Payment methods and security</li>
                </ul>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-2">Common Issues</h3>
                <ul class="list-disc list-inside space-y-1 text-gray-600">
                  <li>Forgot password recovery</li>
                  <li>Booking modification requests</li>
                  <li>Dispute resolution process</li>
                  <li>Refund processing times</li>
                </ul>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-2">Contact Information</h3>
                <p class="text-gray-600">Email: support@nu3pbnb.com</p>
                <p class="text-gray-600">Phone: +1 (555) 123-4567</p>
                <p class="text-gray-600">Hours: 24/7 support available</p>
              </div>
            </div>
          `
        },
        {
          text: t('footer.contactUs'),
          title: 'Contact Us',
          content: `
            <h2 class="text-2xl font-bold mb-4">Contact Us</h2>
            <div class="space-y-6">
              <div>
                <h3 class="text-lg font-semibold mb-2">Customer Service</h3>
                <p class="text-gray-600 mb-2">Our dedicated team is here to help you with any questions or concerns.</p>
                <p class="text-gray-600"><strong>Email:</strong> customerservice@nu3pbnb.com</p>
                <p class="text-gray-600"><strong>Phone:</strong> +1 (555) 123-4567</p>
                <p class="text-gray-600"><strong>Live Chat:</strong> Available 24/7</p>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-2">Business Inquiries</h3>
                <p class="text-gray-600 mb-2">For partnerships, media inquiries, or business opportunities.</p>
                <p class="text-gray-600"><strong>Email:</strong> business@nu3pbnb.com</p>
                <p class="text-gray-600"><strong>Phone:</strong> +1 (555) 987-6543</p>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-2">Office Hours</h3>
                <p class="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM EST</p>
                <p class="text-gray-600">Saturday: 10:00 AM - 4:00 PM EST</p>
                <p class="text-gray-600">Sunday: Closed</p>
              </div>
            </div>
          `
        },
        {
          text: t('footer.safetyInfo'),
          title: 'Safety Information',
          content: `
            <h2 class="text-2xl font-bold mb-4">Safety Information</h2>
            <div class="space-y-6">
              <div>
                <h3 class="text-lg font-semibold mb-2">Guest Safety</h3>
                <ul class="list-disc list-inside space-y-1 text-gray-600">
                  <li>Always verify host identity before booking</li>
                  <li>Read reviews and ratings carefully</li>
                  <li>Use secure payment methods only</li>
                  <li>Keep communication within the platform</li>
                  <li>Report suspicious activity immediately</li>
                </ul>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-2">Host Safety</h3>
                <ul class="list-disc list-inside space-y-1 text-gray-600">
                  <li>Screen guests through our verification system</li>
                  <li>Set clear house rules and expectations</li>
                  <li>Maintain proper insurance coverage</li>
                  <li>Install security measures as needed</li>
                  <li>Document any incidents thoroughly</li>
                </ul>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-2">Emergency Contacts</h3>
                <p class="text-gray-600"><strong>Emergency:</strong> 911 (US) or local emergency number</p>
                <p class="text-gray-600"><strong>nu3PBnB Safety:</strong> +1 (555) 999-8888</p>
                <p class="text-gray-600"><strong>Trust & Safety Team:</strong> safety@nu3pbnb.com</p>
              </div>
            </div>
          `
        }
      ]
    },
    community: {
      title: t('footer.community'),
      links: [
        {
          text: t('footer.disasterRelief'),
          title: 'Disaster Relief',
          content: `
            <h2 class="text-2xl font-bold mb-4">Disaster Relief</h2>
            <div class="space-y-6">
              <div>
                <h3 class="text-lg font-semibold mb-2">Emergency Housing Program</h3>
                <p class="text-gray-600 mb-4">We partner with disaster relief organizations to provide emergency housing for those affected by natural disasters, conflicts, and other emergencies.</p>
                <ul class="list-disc list-inside space-y-1 text-gray-600">
                  <li>Free temporary housing for disaster victims</li>
                  <li>Partnership with Red Cross and FEMA</li>
                  <li>Host volunteer program for emergency housing</li>
                  <li>24/7 emergency response coordination</li>
                </ul>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-2">How to Help</h3>
                <p class="text-gray-600 mb-2">Hosts can volunteer their properties for emergency housing:</p>
                <ul class="list-disc list-inside space-y-1 text-gray-600">
                  <li>Register as an emergency housing host</li>
                  <li>Specify availability and capacity</li>
                  <li>Receive training and support</li>
                  <li>Get compensated for emergency stays</li>
                </ul>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-2">Recent Relief Efforts</h3>
                <p class="text-gray-600">2024: Provided 2,500+ emergency stays for hurricane victims</p>
                <p class="text-gray-600">2023: Supported wildfire evacuees with 1,800+ housing units</p>
                <p class="text-gray-600">2022: Assisted earthquake recovery with 3,200+ temporary homes</p>
              </div>
            </div>
          `
        },
        {
          text: t('footer.supportRefugees'),
          title: 'Support Refugees',
          content: `
            <h2 class="text-2xl font-bold mb-4">Support Refugees</h2>
            <div class="space-y-6">
              <div>
                <h3 class="text-lg font-semibold mb-2">Refugee Housing Initiative</h3>
                <p class="text-gray-600 mb-4">We work with refugee resettlement agencies to provide safe, affordable housing for refugees and asylum seekers in their new communities.</p>
                <ul class="list-disc list-inside space-y-1 text-gray-600">
                  <li>Long-term housing solutions for refugee families</li>
                  <li>Cultural orientation and community integration support</li>
                  <li>Language assistance and translation services</li>
                  <li>Employment and education resource connections</li>
                </ul>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-2">Partnership Organizations</h3>
                <ul class="list-disc list-inside space-y-1 text-gray-600">
                  <li>International Rescue Committee (IRC)</li>
                  <li>Refugee Council USA</li>
                  <li>UNHCR - The UN Refugee Agency</li>
                  <li>Local refugee resettlement agencies</li>
                </ul>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-2">Impact Statistics</h3>
                <p class="text-gray-600">Since 2020, we've helped provide housing for over 15,000 refugees across 45 countries.</p>
                <p class="text-gray-600">Average stay duration: 6-12 months</p>
                <p class="text-gray-600">Success rate: 94% of families find permanent housing</p>
              </div>
            </div>
          `
        },
        {
          text: t('footer.combatDiscrimination'),
          title: 'Combating Discrimination',
          content: `
            <h2 class="text-2xl font-bold mb-4">Combating Discrimination</h2>
            <div class="space-y-6">
              <div>
                <h3 class="text-lg font-semibold mb-2">Our Commitment</h3>
                <p class="text-gray-600 mb-4">nu3PBnB is committed to creating an inclusive platform where everyone feels welcome, regardless of race, ethnicity, religion, gender, sexual orientation, disability, or any other characteristic.</p>
                <ul class="list-disc list-inside space-y-1 text-gray-600">
                  <li>Zero tolerance for discrimination</li>
                  <li>Comprehensive anti-bias training for hosts</li>
                  <li>Diverse representation in our team and leadership</li>
                  <li>Regular platform audits for bias detection</li>
                </ul>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-2">Reporting Discrimination</h3>
                <p class="text-gray-600 mb-2">If you experience discrimination on our platform:</p>
                <ul class="list-disc list-inside space-y-1 text-gray-600">
                  <li>Report incidents immediately through our app or website</li>
                  <li>Contact our Trust & Safety team at discrimination@nu3pbnb.com</li>
                  <li>All reports are investigated within 24 hours</li>
                  <li>Confidential handling of all discrimination cases</li>
                </ul>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-2">Educational Resources</h3>
                <ul class="list-disc list-inside space-y-1 text-gray-600">
                  <li>Implicit bias training for hosts</li>
                  <li>Cultural competency workshops</li>
                  <li>Inclusive hosting guidelines</li>
                  <li>Community forums for open dialogue</li>
                </ul>
              </div>
            </div>
          `
        }
      ]
    },
    hosting: {
      title: t('footer.hosting'),
      links: [
        {
          text: t('footer.hostYourHome'),
          title: 'Host Your Home',
          content: `
            <h2 class="text-2xl font-bold mb-4">Host Your Home</h2>
            <div class="space-y-6">
              <div>
                <h3 class="text-lg font-semibold mb-2">Getting Started</h3>
                <p class="text-gray-600 mb-4">Turn your extra space into extra income by hosting travelers from around the world.</p>
                <ul class="list-disc list-inside space-y-1 text-gray-600">
                  <li>Create your listing in minutes</li>
                  <li>Set your own schedule and pricing</li>
                  <li>Choose your guests</li>
                  <li>Earn money while you're away</li>
                </ul>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-2">Hosting Benefits</h3>
                <ul class="list-disc list-inside space-y-1 text-gray-600">
                  <li>Earn up to $3,000+ per month</li>
                  <li>Flexible hosting schedule</li>
                  <li>24/7 support from our team</li>
                  <li>Insurance coverage included</li>
                  <li>Professional photography service</li>
                </ul>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-2">Requirements</h3>
                <ul class="list-disc list-inside space-y-1 text-gray-600">
                  <li>Clean, safe, and well-maintained space</li>
                  <li>Basic amenities (WiFi, clean linens, etc.)</li>
                  <li>Responsive communication with guests</li>
                  <li>Compliance with local regulations</li>
                  <li>Background check verification</li>
                </ul>
              </div>
            </div>
          `
        },
        {
          text: t('footer.hostExperience'),
          title: 'Host an Experience',
          content: `
            <h2 class="text-2xl font-bold mb-4">Host an Experience</h2>
            <div class="space-y-6">
              <div>
                <h3 class="text-lg font-semibold mb-2">Create Unique Experiences</h3>
                <p class="text-gray-600 mb-4">Share your passion and expertise with travelers by hosting unique experiences in your city.</p>
                <ul class="list-disc list-inside space-y-1 text-gray-600">
                  <li>Cooking classes and food tours</li>
                  <li>Art workshops and cultural experiences</li>
                  <li>Outdoor adventures and nature walks</li>
                  <li>Historical tours and storytelling</li>
                  <li>Music, dance, and performance workshops</li>
                </ul>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-2">Experience Categories</h3>
                <ul class="list-disc list-inside space-y-1 text-gray-600">
                  <li><strong>Food & Drink:</strong> Cooking classes, wine tastings, market tours</li>
                  <li><strong>Arts & Culture:</strong> Painting workshops, museum tours, local crafts</li>
                  <li><strong>Nature & Outdoors:</strong> Hiking, bird watching, gardening</li>
                  <li><strong>Wellness:</strong> Yoga, meditation, spa experiences</li>
                  <li><strong>Adventure:</strong> Rock climbing, kayaking, photography tours</li>
                </ul>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-2">Hosting Guidelines</h3>
                <ul class="list-disc list-inside space-y-1 text-gray-600">
                  <li>Experiences must be authentic and personal</li>
                  <li>Maximum group size: 10 people</li>
                  <li>Duration: 1-8 hours</li>
                  <li>Safety and insurance requirements apply</li>
                  <li>Quality standards and guest feedback monitoring</li>
                </ul>
              </div>
            </div>
          `
        },
        {
          text: t('footer.responsibleHosting'),
          title: 'Responsible Hosting',
          content: `
            <h2 class="text-2xl font-bold mb-4">Responsible Hosting</h2>
            <div class="space-y-6">
              <div>
                <h3 class="text-lg font-semibold mb-2">Environmental Responsibility</h3>
                <p class="text-gray-600 mb-4">Help us create a more sustainable travel industry by implementing eco-friendly practices.</p>
                <ul class="list-disc list-inside space-y-1 text-gray-600">
                  <li>Use energy-efficient appliances and lighting</li>
                  <li>Provide recycling and composting options</li>
                  <li>Use eco-friendly cleaning products</li>
                  <li>Install water-saving fixtures</li>
                  <li>Offer local, sustainable transportation options</li>
                </ul>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-2">Community Impact</h3>
                <ul class="list-disc list-inside space-y-1 text-gray-600">
                  <li>Respect local noise ordinances and quiet hours</li>
                  <li>Support local businesses and artisans</li>
                  <li>Educate guests about local customs and etiquette</li>
                  <li>Minimize waste and single-use plastics</li>
                  <li>Contribute to local community initiatives</li>
                </ul>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-2">Safety & Compliance</h3>
                <ul class="list-disc list-inside space-y-1 text-gray-600">
                  <li>Maintain proper insurance coverage</li>
                  <li>Follow local zoning and licensing requirements</li>
                  <li>Ensure fire safety and emergency preparedness</li>
                  <li>Regular property maintenance and inspections</li>
                  <li>Clear communication of house rules and policies</li>
                </ul>
              </div>
            </div>
          `
        }
      ]
    }
  };

  return (
    <>
      <footer className="bg-gray-100 dark:bg-gray-900 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">nu3PBnB</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('footer.description')}
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
            
            {Object.entries(footerSections).map(([key, section]) => (
              <div key={key}>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link, index) => (
                    <li key={index}>
                      <a 
                        href="#" 
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        onClick={(e) => handleLinkClick(e, link.title, link.content)}
                      >
                        {link.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                © 2024 nu3PBnB, Inc. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a 
                  href="#" 
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm"
                  onClick={(e) => handleLinkClick(e, 'Privacy Policy', `
                    <h2 class="text-2xl font-bold mb-4">Privacy Policy</h2>
                    <div class="space-y-4">
                      <p class="text-gray-600">Last updated: January 2024</p>
                      <p class="text-gray-600">This Privacy Policy describes how nu3PBnB collects, uses, and shares your personal information when you use our platform.</p>
                      <h3 class="text-lg font-semibold">Information We Collect</h3>
                      <ul class="list-disc list-inside text-gray-600">
                        <li>Account information (name, email, phone number)</li>
                        <li>Payment information (processed securely through third-party providers)</li>
                        <li>Booking and travel preferences</li>
                        <li>Communication with hosts and guests</li>
                        <li>Device and usage information</li>
                      </ul>
                    </div>
                  `)}
                >
                  Privacy Policy
                </a>
                <a 
                  href="#" 
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm"
                  onClick={(e) => handleLinkClick(e, 'Terms of Service', `
                    <h2 class="text-2xl font-bold mb-4">Terms of Service</h2>
                    <div class="space-y-4">
                      <p class="text-gray-600">Last updated: January 2024</p>
                      <p class="text-gray-600">By using nu3PBnB, you agree to these terms and conditions governing your use of our platform.</p>
                      <h3 class="text-lg font-semibold">User Responsibilities</h3>
                      <ul class="list-disc list-inside text-gray-600">
                        <li>Provide accurate and truthful information</li>
                        <li>Respect property rules and local laws</li>
                        <li>Maintain appropriate behavior and communication</li>
                        <li>Pay all fees and charges promptly</li>
                        <li>Report any issues or concerns immediately</li>
                      </ul>
                    </div>
                  `)}
                >
                  Terms of Service
                </a>
                <a 
                  href="#" 
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm"
                  onClick={(e) => handleLinkClick(e, 'Cookie Policy', `
                    <h2 class="text-2xl font-bold mb-4">Cookie Policy</h2>
                    <div class="space-y-4">
                      <p class="text-gray-600">Last updated: January 2024</p>
                      <p class="text-gray-600">We use cookies and similar technologies to enhance your experience on our platform.</p>
                      <h3 class="text-lg font-semibold">Types of Cookies We Use</h3>
                      <ul class="list-disc list-inside text-gray-600">
                        <li>Essential cookies for platform functionality</li>
                        <li>Analytics cookies to improve our services</li>
                        <li>Preference cookies to remember your settings</li>
                        <li>Marketing cookies for personalized content</li>
                      </ul>
                    </div>
                  `)}
                >
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal for displaying footer link content */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {modalContent.title}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>
              <div 
                className="prose prose-gray dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: modalContent.content }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer; 