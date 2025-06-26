import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: '' });
  const currentYear = new Date().getFullYear();

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
      <footer className="bg-gray-900 text-white py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold mb-2">nu3PBnB</h3>
              <p className="text-gray-400 text-sm">
                Next-generation property booking platform
              </p>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-400 mb-2">
                © {currentYear} Robbie Bisnath. All rights reserved.
              </p>
              <p className="text-sm text-gray-400">
                Contact: <a 
                  href="mailto:robbie.bisnath@3pillarglobal.com" 
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  robbie.bisnath@3pillarglobal.com
                </a>
              </p>
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