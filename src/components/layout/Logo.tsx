/**
 * Componente Logo - Logo da AutoBrilho
 * Versão texto com estilização dourada
 */

export function Logo() {
  return (
    <a 
      href="/" 
      className="flex items-center gap-2 group"
    >
      {/* Ícone do logo */}
      <div className="relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-gold-dark via-gold to-gold-light rounded-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
        <span className="text-gold font-heading font-bold text-lg md:text-xl relative z-10">
          AB
        </span>
      </div>
      
      {/* Texto do logo */}
      <div className="flex flex-col">
        <span className="font-heading font-bold text-lg md:text-xl text-cream leading-none">
          Auto<span className="text-gold">Brilho</span>
        </span>
        <span className="text-[10px] md:text-xs text-cream-dark uppercase tracking-widest">
          Estética Automotiva
        </span>
      </div>
    </a>
  );
}

export default Logo;
