export default function WhatsAppButton() {
  const whatsappNumber = "5511999999999" // Substitua pelo número correto
  
  return (
    <a
      href={`https://wa.me/${whatsappNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-green-500 p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors"
    >
      <svg
        className="w-6 h-6 text-white"
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M20.4 3.6C18.2 1.4 15.2 0 12 0 5.4 0 0 5.4 0 12c0 2.1.6 4.2 1.7 6L0 24l6.3-1.7c1.8 1 3.8 1.5 5.7 1.5 6.6 0 12-5.4 12-12 0-3.2-1.4-6.2-3.6-8.4zm-8.4 18.3c-1.8 0-3.5-.5-5-1.3l-.4-.2-3.6 1 1-3.6-.2-.4c-1-1.6-1.5-3.4-1.5-5.2 0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10z"/>
      </svg>
    </a>
  )
} 