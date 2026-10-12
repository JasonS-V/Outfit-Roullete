import { createContext, useContext, type ReactNode } from 'react';

export type Language = 'es' | 'en';

export const LanguageContext = createContext<Language>('es');

// shortcut: los textos nuevos quedan en español hasta agregarlos aquí; usar claves tipadas si crece mucho la interfaz.
const english: Record<string, string> = {
  // Navigation, onboarding, and appearance
  'Hoy': 'Today', 'Armario': 'Wardrobe', 'Guardados': 'Saved', 'Ajustes': 'Settings',
  'Sistema': 'System', 'Claro': 'Light', 'Oscuro': 'Dark',
  'Salvia': 'Sage', 'Azul': 'Blue', 'Rosa': 'Rose', 'Negro': 'Black',
  'Idioma': 'Language', 'Tema': 'Theme', 'Color': 'Color', 'Apariencia': 'Appearance',
  'OUTFIT ROULETTE': 'OUTFIT ROULETTE', 'TU ARMARIO, REINVENTADO': 'YOUR WARDROBE, REIMAGINED',
  'Tu ropa.\nMás posibilidades.': 'Your clothes.\nMore possibilities.',
  'Tu ropa.': 'Your clothes.', 'Más posibilidades.': 'More possibilities.',
  'Looks para cada día, creados con la ropa que ya tienes.': 'Everyday outfits made with the clothes you already own.',
  'Personaliza el tema, el color y el idioma antes de empezar.': 'Choose your theme, color, and language before you begin.',
  'Empezar': 'Get started', 'Hazla tuya': 'Make it yours',
  'Elige cómo quieres ver la app. Puedes cambiarlo después en Ajustes.': 'Choose how the app looks. You can change this later in Settings.',
  'Continuar': 'Continue', 'Ropa femenina': "Women's clothing",
  'Vestidos, faldas y básicos femeninos primero': 'Dresses, skirts, and feminine basics first',
  'Ropa masculina': "Men's clothing", 'Los básicos de siempre primero': 'Everyday basics first',
  'Ambas / Neutro': 'Both / Neutral', 'Una biblioteca sin etiquetas': 'A wardrobe without labels',
  '¿Qué tipo de prendas prefieres ver primero?': 'Which clothes would you like to see first?',
  'Solo sirve para ordenar la biblioteca de básicos. Puedes cambiarlo luego.': 'This only sorts the basics library. You can change it later.',
  'Arma tu armario inicial': 'Build your starter wardrobe',
  'Necesitas al menos una prenda por categoría': 'Choose at least one item in each category',
  '¿Adaptamos tus outfits al clima de hoy?': "Should we adapt your outfits to today's weather?",
  'Con el clima activo, la ruleta enciende sola tu capa de abrigo cuando haga frío.': 'With weather on, the roulette adds a layer when it gets cold.',
  'Con clima activo, tus giros cambian solos con la temperatura.': 'With weather on, your spins adapt to the temperature.',
  'Leyendo clima…': 'Checking weather…', 'Usar mi ubicación': 'Use my location',
  'Elegir mi ciudad': 'Choose my city', 'Continuar con este clima': 'Continue with this weather',
  'Ahora no': 'Not now', 'Superior': 'Tops', 'Inferior': 'Bottoms', 'Calzado': 'Shoes',
  'EL EDITORIAL  /  01': 'THE EDITORIAL  /  01',
  'Blazer lavanda en un estudio editorial': 'Lavender blazer in an editorial studio',

  // Roulette
  '¿Qué te pones hoy?': 'What will you wear today?',
  'Modo caos: sin reglas de color ni formalidad': 'Chaos mode: no color or formality rules',
  'Hace calor: hoy giramos sin capa': 'It’s warm: no layer needed today',
  'Clima templado': 'Mild weather', 'Hace fresco: capa activada': 'It’s cool: layer on',
  'Frío de hoy: capa obligatoria': 'It’s cold: layer required',
  'Sin clima: usaremos una temperatura templada': 'No weather: using a mild temperature',
  '¿Cuál es tu plan?': 'What are your plans?',
  'Toca el candado para fijar una prenda y girar solo el resto': 'Tap the lock to keep an item while spinning the rest',
  'Tu combinación': 'Your outfit', 'Desliza para cambiar': 'Swipe to change',
  'Tu armario está vacío': 'Your wardrobe is empty',
  'Añade algunas prendas para crear tu primer look.': 'Add a few items to make your first outfit.',
  'Me lo pongo': 'Wear this', 'Guardar': 'Save', 'Deshacer': 'Undo', 'Compartir': 'Share',
  'Añadir prendas': 'Add clothes', 'Girando…': 'Spinning…',
  'Desbloquea una prenda': 'Unlock an item', 'Girar otro look': 'Spin another outfit',
  'Crear mi look': 'Make my outfit', 'Crea una combinación con tu ropa': 'Make an outfit with your clothes',
  'Tu armario aún no tiene ropa deportiva. Suma prendas con etiqueta sport.': 'Your wardrobe has no sportswear yet. Add some athletic clothes.',
  'Añadir prenda': 'Add item',
  'Hace frío y tu armario aún no tiene capas: suma una casaca o chompa.': 'It’s cold and your wardrobe has no layers yet. Add a jacket or sweater.',
  'Añadir capa': 'Add layer',
  'No hay combinaciones posibles con esos filtros. Prueba otra ocasión.': 'No outfits match these filters. Try another occasion.',
  'Look guardado en tu Lookbook': 'Outfit saved to your Lookbook',
  '¡Registrado! No te sugeriremos este look los próximos días': 'Done! We won’t suggest this outfit for the next few days',
  'Look copiado, pégalo donde quieras': 'Outfit copied. Paste it anywhere',
  'No se pudo compartir en este dispositivo': 'Could not share on this device',
  'Todo': 'All', 'Clases': 'Classes', 'Salida': 'Going out', 'Fiesta': 'Party', 'Gym': 'Gym',
  'Arriba': 'Tops', 'Abajo': 'Bottoms', 'Capas': 'Layers', 'Una pieza': 'One piece',
  'Parte superior': 'Top', 'Parte inferior': 'Bottom', 'Capa': 'Layer',
  'Sin prendas todavía': 'No items yet',
  'Carrete fijado. Toca para desbloquear': 'Reel locked. Tap to unlock',
  'Fijar este carrete': 'Lock this reel',

  // Wardrobe and garment picker
  'Tu armario': 'Your wardrobe', 'para combinar': 'to combine',
  'En lavandería': 'In laundry', 'Buscar en el armario': 'Search wardrobe',
  'Buscar por prenda o color': 'Search by item or color',
  'Elige prendas de la biblioteca para empezar a combinar.': 'Choose items from the library to start making outfits.',
  'No hay prendas que coincidan con ese filtro.': 'No items match that filter.',
  'Limpiar filtros': 'Clear filters', 'Abrigo': 'Warmth', 'Formalidad': 'Formality',
  'Sin usos registrados todavía': 'No wears recorded yet', 'Te la pusiste hoy': 'You wore it today',
  'Quitar de favoritas': 'Remove from favorites', 'Marcar como favorita': 'Add to favorites',
  'Sacar de lavandería': 'Remove from laundry', 'No usar hoy (a lavandería)': 'Put in laundry',
  'Eliminar del armario': 'Remove from wardrobe', 'Eliminar prenda': 'Delete item',
  'Prenda eliminada de tu armario': 'Item removed from your wardrobe',
  'Volver al armario': 'Back to wardrobe',
  'Elige la prenda que más se parezca a la tuya y luego su color.': 'Choose the closest item and then its color.',
  'Añadir a mi armario': 'Add to my wardrobe',

  // Saved looks
  'Looks guardados': 'Saved outfits', 'Aún no guardas looks': 'No saved outfits yet',
  'Crea un look en Hoy y toca Guardar para tenerlo siempre a mano.': 'Make an outfit on Today and tap Save to keep it here.',
  'Girar ahora': 'Spin now', 'Todos': 'All',
  'Ningún look guardado coincide con el clima de hoy.': 'No saved outfit matches today’s weather.',
  'Ver todos': 'View all', 'Look guardado': 'Saved outfit',
  'Una o más prendas de este look ya no están en tu armario.': 'One or more items in this outfit are no longer in your wardrobe.',
  'Cargar en la ruleta': 'Load in roulette',
  'Look cargado con candados en la ruleta': 'Outfit loaded with locked reels',
  'Me lo pongo hoy': 'Wear this today',
  'Registrado. No te sugeriremos este look los próximos días': 'Done. We won’t suggest this outfit for the next few days',
  'Eliminar look': 'Delete outfit', 'Se quitará del Lookbook para siempre.': 'It will be removed from your Lookbook permanently.',
  'Look eliminado': 'Outfit deleted',

  // Settings and weather
  'Haz que los looks se adapten a ti.': 'Make your outfits fit you.',
  'Experiencia': 'Experience', 'Sonido': 'Sound',
  'Tics del carrete, golpes de parada y chime final': 'Reel ticks, stop sounds, and final chime',
  'Vibración': 'Vibration', 'Feedback táctil en el giro y los candados': 'Haptic feedback for spins and locks',
  'Modo caos': 'Chaos mode', 'Sin reglas de color ni formalidad: ideal para retos': 'No color or formality rules: great for challenges',
  'Capa en clima templado': 'Layer in mild weather',
  'Muestra el carrete de capa aunque no haga frío': 'Show the layer reel even when it’s not cold',
  'Tú y el clima': 'You and the weather', '¿Cómo sientes el frío?': 'How do you feel the cold?',
  'Soy caluroso/a': 'I run warm', 'Neutro': 'Neutral', 'Soy friolento/a': 'I run cold',
  'Clima sin configurar': 'Weather not set up', 'Configurar clima': 'Set up weather',
  'Tu ropero': 'Your wardrobe', 'Prendas': 'Items', 'Looks': 'Outfits',
  'Usos esta semana': 'Wears this week',
  'Aún no registras usos: toca Me lo pongo después de girar': 'No wears logged yet: tap Wear this after a spin',
  'Sin prendas dormidas por ahora: todo tu ropero está en rotación': 'No unworn items right now: your whole wardrobe is in rotation',
  'Datos': 'Data', 'Exportar respaldo': 'Export backup', 'Importar respaldo': 'Import backup',
  'Guardar respaldo': 'Save backup',
  'Importar': 'Import', 'Eliminar': 'Delete', 'Cancelar': 'Cancel',
  'No se pudo exportar el respaldo.': 'Could not export the backup.',
  'Respaldo importado.': 'Backup imported.',
  'No se pudo importar. Comprueba que sea un respaldo válido.': 'Could not import. Check that the backup is valid.',
  'El respaldo incluye armario, looks, historial, preferencias y ciudad elegida.': 'The backup includes your wardrobe, outfits, history, preferences, and chosen city.',
  'Eliminar todos mis datos': 'Delete all my data', 'Eliminar todo': 'Delete everything',
  'Se borran armario, looks e historial de este dispositivo. Esta acción no se puede deshacer.': 'Your wardrobe, outfits, and history will be deleted from this device. This cannot be undone.',
  'Datos eliminados. Vuelves al inicio.': 'Data deleted. Returning to the start.',
  'No se pudieron eliminar los datos. Intenta de nuevo.': 'Could not delete the data. Try again.',
  'Tus datos se guardan en este dispositivo, sin cuenta. Exporta un respaldo para llevarlos a otro.': 'Your data is stored on this device, with no account. Export a backup to move it to another device.',
  'Outfit Roulette · Tu ropa, nuevas combinaciones.': 'Outfit Roulette · Your clothes, new combinations.',
  'Apoya el proyecto': 'Support the project',
  '¿Te gusta Outfit Roulette? Puedes apoyarlo en Ko-fi.': 'Enjoying Outfit Roulette? You can support it on Ko-fi.',
  'Ver más': 'Learn more',
  'Si quieres apoyar el desarrollo de Outfit Roulette, puedes hacerlo en Ko-fi.': 'If you want to support Outfit Roulette’s development, you can do so on Ko-fi.',
  'La donación es opcional. Puedes seguir usando todas las funciones gratis.': 'Donating is optional. You can keep using every feature for free.',
  'Apoyar en Ko-fi': 'Support on Ko-fi',
  'Abre Ko-fi en tu navegador': 'Opens Ko-fi in your browser',
  'No se pudo abrir Ko-fi. Inténtalo de nuevo.': 'Could not open Ko-fi. Please try again.',
  'Clima': 'Weather', 'Cargando…': 'Loading…', 'Buscar ciudad': 'Search city',
  'Escribe tu ciudad (ej. Lima)': 'Enter your city (e.g. Lima)', 'Buscar': 'Search',
  'Escribe al menos 2 letras': 'Enter at least 2 letters',
  'No encontramos esa ciudad. Prueba con otro nombre.': 'We couldn’t find that city. Try another name.',
  'No pudimos buscar la ciudad. Revisa tu conexión.': 'Could not search for the city. Check your connection.',
  'Sin región': 'No region', 'Clima de hoy': 'Today’s weather',
  'Adaptamos tus giros al frío o calor de tu ciudad.': 'Your spins adapt to the temperature in your city.',
  'Si activas el clima, la ruleta activa sola tu capa de abrigo cuando haga falta.': 'With weather on, the roulette adds a layer when needed.',
  'o elige tu ciudad manualmente': 'or choose your city manually',
  'Ubicación no disponible. Elige tu ciudad manualmente.': 'Location unavailable. Choose your city manually.',
  'Tu ubicación': 'Your location', 'Sin conexión. Puedes seguir girando sin clima.': 'Offline. You can keep spinning without weather.',
  'No pudimos leer el clima. Intenta de nuevo.': 'Could not load the weather. Try again.',
  'No se pudieron leer los datos guardados. Importa un respaldo o reinicia la app.': 'Could not read saved data. Import a backup or restart the app.',
  'No se pudieron guardar los cambios en este dispositivo.': 'Could not save changes on this device.',
  'Cerrar panel': 'Close panel', 'También puedes deslizar hacia abajo': 'You can also swipe down',
  'Blanco puro': 'Pure white', 'Negro azabache': 'Jet black', 'Gris melange': 'Heather gray',
  'Gris marengo': 'Charcoal gray', 'Azul denim claro': 'Light denim blue',
  'Azul denim clásico': 'Classic denim blue', 'Azul marino': 'Navy blue',
  'Beige arena': 'Sand beige', 'Marrón chocolate': 'Chocolate brown',
  'Verde militar': 'Olive green', 'Verde botella': 'Bottle green',
  'Rojo borgoña': 'Burgundy', 'Rojo carmín': 'Crimson red',
  'Rosa pastel': 'Pastel pink', 'Amarillo mostaza': 'Mustard yellow',
  'Lavanda suave': 'Soft lavender', 'Color personalizado': 'Custom color',
  // Basic item names are stored in Spanish in existing wardrobes and backups.
  'Polo básico cuello redondo': 'Basic crew-neck T-shirt',
  'Polo oversize manga corta': 'Oversized short-sleeve T-shirt',
  'Polo boxy fit': 'Boxy-fit T-shirt', 'Polo cuello V': 'V-neck T-shirt',
  'Polo sin mangas': 'Sleeveless top', 'Polo piqué': 'Piqué polo shirt',
  'Camisa blanca de vestir': 'White dress shirt',
  'Camisa de lino manga larga': 'Long-sleeve linen shirt',
  'Camisa de lino manga corta': 'Short-sleeve linen shirt',
  'Camisa de cuadros franela': 'Plaid flannel shirt',
  'Camisa de jean': 'Denim shirt', 'Blusa de seda ligera': 'Light silk blouse',
  'Top corto básico': 'Basic crop top', 'Top cuello halter': 'Halter top',
  'Polera cuello redondo': 'Crew-neck sweatshirt',
  'Hoodie con capucha oversize': 'Oversized hoodie',
  'Hoodie con cierre frontal': 'Zip-up hoodie',
  'Chompa de lana trenzada': 'Cable-knit sweater',
  'Suéter fino cuello tortuga': 'Fine-knit turtleneck',
  'Cardigan de botones': 'Button cardigan',
  'Polo manga larga básica': 'Basic long-sleeve T-shirt',
  'Polo gráfico urbano': 'Graphic T-shirt',
  'Top deportivo transpirable': 'Breathable sports top',
  'Camiseta térmica manga larga': 'Long-sleeve thermal shirt',
  'Chaleco de lana escote V': 'V-neck knit vest',
  'Jean azul recto clásico': 'Classic straight blue jeans',
  'Jean azul claro desgastado': 'Faded light blue jeans',
  'Jean negro slim': 'Slim black jeans', 'Jean baggy': 'Baggy jeans',
  'Jean wide leg acampanado': 'Wide-leg jeans',
  'Pantalón cargo con bolsillos': 'Cargo pants with pockets',
  'Jogger de algodón con puño': 'Cuffed cotton joggers',
  'Pantalón chino beige': 'Beige chinos',
  'Pantalón sastre pinzado': 'Pleated tailored trousers',
  'Pantalón de lino relajado': 'Relaxed linen trousers',
  'Short de jean clásico': 'Classic denim shorts',
  'Short cargo de gabardina': 'Cotton twill cargo shorts',
  'Short deportivo de running': 'Running shorts',
  'Biker short de licra': 'Stretch biker shorts',
  'Bermuda de lino veraniega': 'Summer linen Bermuda shorts',
  'Falda corta de tablas': 'Short pleated skirt',
  'Falda vaquera midi': 'Midi denim skirt',
  'Falda satinada larga': 'Long satin skirt',
  'Leggings deportivas': 'Sports leggings',
  'Pantalón parachute urbano': 'Parachute pants',
  'Casaca de jean oversize': 'Oversized denim jacket',
  'Casaca bomber': 'Bomber jacket',
  'Casaca de cuero biker': 'Biker leather jacket',
  'Cortaviento impermeable': 'Waterproof windbreaker',
  'Casaca acolchada puffer': 'Puffer jacket',
  'Abrigo largo de paño': 'Long wool coat',
  'Blazer casual estructurado': 'Structured casual blazer',
  'Gabardina clásica': 'Classic trench coat',
  'Cardigan largo sin botones': 'Long open cardigan',
  'Parka con capucha': 'Hooded parka',
  'Chaleco acolchado puffer': 'Puffer vest',
  'Sobrecamisa gruesa de pana': 'Thick corduroy overshirt',
  'Zapatillas blancas urbanas': 'White everyday sneakers',
  'Zapatillas de lona altas': 'High-top canvas sneakers',
  'Zapatillas chunky': 'Chunky sneakers',
  'Zapatillas de running': 'Running shoes',
  'Zapatillas de skate planas': 'Flat skate shoes',
  'Botines Chelsea de cuero': 'Leather Chelsea boots',
  'Botas altas estilo militar': 'Tall combat boots',
  'Botas vaqueras de caña media': 'Mid-calf cowboy boots',
  'Mocasines clásicos de cuero': 'Classic leather loafers',
  'Zapatos de vestir Oxford': 'Oxford dress shoes',
  'Sandalias planas': 'Flat sandals',
  'Sandalias de plataforma': 'Platform sandals',
  'Chancletas de goma': 'Rubber slides',
  'Zapatos de tacón medio': 'Mid-heel shoes',
  'Alpargatas de esparto': 'Espadrilles',
  'Vestido corto de verano': 'Short summer dress',
  'Vestido camisero casual': 'Casual shirt dress',
  'Vestido midi floreado': 'Floral midi dress',
  'Vestido negro de noche': 'Black evening dress',
  'Vestido ajustado canalé': 'Fitted ribbed dress',
  'Enterizo largo con lazo': 'Long tie-waist jumpsuit',
  'Enterizo corto playero': 'Short beach playsuit',
  'Mono utilitario de gabardina': 'Cotton twill utility jumpsuit',
};

export function translate(text: string, language: Language): string {
  if (language === 'es') return text;
  if (Object.prototype.hasOwnProperty.call(english, text)) return english[text];
  const match = text.match(/^(\d+) (prenda|prendas) para combinar$/);
  if (match) return `${match[1]} ${match[2] === 'prenda' ? 'item' : 'items'} to combine`;
  const lookCount = text.match(/^(\d+) (combinación|combinaciones) que te gustaron$/);
  if (lookCount) return `${lookCount[1]} ${lookCount[2] === 'combinación' ? 'outfit' : 'outfits'} you liked`;
  const recommended = text.match(/^Toca las prendas que se parecen a las tuyas\. Llevas (\d+) de (\d+) recomendadas\.$/);
  if (recommended) return `Tap items like yours. You’ve chosen ${recommended[1]} of ${recommended[2]} recommended.`;
  const spinCount = text.match(/^¡Listo, a girar! \((\d+)\)$/);
  if (spinCount) return `Ready to spin! (${spinCount[1]})`;
  const lastWorn = text.match(/^Última vez hace (\d+) (día|días)$/);
  if (lastWorn) return `Last worn ${lastWorn[1]} ${lastWorn[2] === 'día' ? 'day' : 'days'} ago`;
  const today = text.match(/^Para hoy · (\d+)$/);
  if (today) return `For today · ${today[1]}`;
  const saved = text.match(/^Guardado el (.+)$/);
  if (saved) return `Saved on ${saved[1]}`;
  const loaded = text.match(/^Look cargado con candados \(faltan (\d+) prendas?\)$/);
  if (loaded) return `Outfit loaded with locked reels (${loaded[1]} ${loaded[1] === '1' ? 'item' : 'items'} missing)`;
  const added = text.match(/^Añadida: (.+)$/);
  if (added) return `Added: ${translate(added[1], language)}`;
  const weatherNow = text.match(/^(.+) · (-?\d+)°C ahora$/);
  if (weatherNow) return `${weatherNow[1]} · ${weatherNow[2]}°C now`;
  const feelsLike = text.match(/^(.+) · (-?\d+)°C de sensación térmica$/);
  if (feelsLike) return `${feelsLike[1]} · feels like ${feelsLike[2]}°C`;
  const favorite = text.match(/^Tu prenda más usada: (.+) \((\d+) usos?\)$/);
  if (favorite) return `Most worn item: ${translate(favorite[1], language)} (${favorite[2]} ${favorite[2] === '1' ? 'wear' : 'wears'})`;
  const dormant = text.match(/^Armario dormido: (\d+) prendas? lleva[n]? más de 45 días sin usarse$/);
  if (dormant) return `${dormant[1]} ${dormant[1] === '1' ? 'item has' : 'items have'} not been worn in over 45 days`;
  const warmth = text.match(/^Abrigo (\d+)\/4 · Formalidad (\d+)\/5(.*)$/);
  if (warmth) return `Warmth ${warmth[1]}/4 · Formality ${warmth[2]}/5${warmth[3]}`;
  const savedTemperature = text.match(/^(.+) · guardado con (-?\d+)°C$/);
  if (savedTemperature) return `${translate(savedTemperature[1], language)} · saved at ${savedTemperature[2]}°C`;
  const importMessage = text.match(/^Este archivo contiene (\d+) prendas, (\d+) looks y (\d+) usos\. Reemplazará todos los datos actuales de este dispositivo\.$/);
  if (importMessage) return `This file contains ${importMessage[1]} items, ${importMessage[2]} outfits, and ${importMessage[3]} wears. It will replace all current data on this device.`;
  const deleteMessage = text.match(/^Se quitará "(.+)" de tu armario\. Los looks guardados que la usen se conservan sin ella\.$/);
  if (deleteMessage) return `"${translate(deleteMessage[1], language)}" will be removed from your wardrobe. Saved outfits that use it will be kept without it.`;
  if (text.includes(' · ')) return text.split(' · ').map((part) => translate(part, language)).join(' · ');
  const titleCase = (text[0] ?? '') + text.slice(1).toLowerCase();
  return text === text.toUpperCase() && Object.prototype.hasOwnProperty.call(english, titleCase)
    ? english[titleCase].toUpperCase()
    : text;
}

export function translateChildren(children: ReactNode, language: Language): ReactNode {
  if (typeof children === 'string') return translate(children, language);
  if (Array.isArray(children) && children.every((part) => typeof part === 'string' || typeof part === 'number')) {
    return translate(children.join(''), language);
  }
  return children;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
