/**
 * Íconos dibujados del cromo de la app (§15).
 *
 * Razón (R-31): el emoji trae su propio color, peso y línea en cada plataforma,
 * así que rompe la retícula y el tono "Boutique Arcade". Un set propio de trazo
 * redondeado, del mismo lenguaje que las siluetas y los íconos de pestañas,
 * mantiene la interfaz coherente en iOS, Android y web.
 *
 * Todos los íconos comparten viewBox 24 y heredan color por prop.
 */

import Svg, { Circle, Path, Rect } from 'react-native-svg';

export interface IconProps {
  /** Lado del cuadro en puntos. */
  size?: number;
  color: string;
  strokeWidth?: number;
}

/** Carrete de la ruleta (pestaña Ruleta y CTA GIRAR). */
export function RouletteIcon({ size = 22, color, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={8.6} stroke={color} strokeWidth={strokeWidth} fill="none" />
      <Path
        d="M12 12 L12 3.4 M12 12 L20.6 12 M12 12 L5.9 18.6 M12 12 L18.1 18.6"
        stroke={color}
        strokeWidth={strokeWidth - 0.3}
        strokeLinecap="round"
        fill="none"
      />
      <Circle cx={12} cy={12} r={1.9} fill={color} />
    </Svg>
  );
}

/** Colgador del armario. */
export function HangerIcon({ size = 22, color, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12.4 6.6 a2.3 2.3 0 1 1 2.3 2.3 L12 11"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M12 11 L4.4 16.8 Q3.2 17.9 4.7 18.7 L19.3 18.7 Q20.8 17.9 19.6 16.8 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

const STAR_PATH =
  'M12 3.8 l2.4 5 5.5 0.8 -4 3.9 1 5.5 -4.9 -2.6 -4.9 2.6 1 -5.5 -4 -3.9 5.5 -0.8 Z';

/** Estrella (looks guardados). */
export function StarIcon({ size = 22, color, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d={STAR_PATH} stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

/** Estrella rellena (prenda favorita). */
export function StarFilledIcon({ size = 22, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d={STAR_PATH} fill={color} stroke={color} strokeWidth={1} strokeLinejoin="round" />
    </Svg>
  );
}

/** Persona (pestaña Yo). */
export function PersonIcon({ size = 22, color, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={8.3} r={3.5} stroke={color} strokeWidth={strokeWidth} fill="none" />
      <Path d="M5.2 20 Q12 14.4 18.8 20" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

/** Cruz de añadir (FAB del armario). */
export function PlusIcon({ size = 22, color, strokeWidth = 2.4 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 5.5 V18.5 M5.5 12 H18.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

/** Lupa del buscador. */
export function SearchIcon({ size = 22, color, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={11} cy={11} r={6.2} stroke={color} strokeWidth={strokeWidth} fill="none" />
      <Path d="M15.7 15.7 L20 20" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

/** Check de confirmación (me lo pongo). */
export function CheckIcon({ size = 22, color, strokeWidth = 2.4 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M5.5 12.8 L9.8 17 L18.5 7"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

/** Flecha de deshacer. */
export function UndoIcon({ size = 22, color, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M9.5 5.5 L5 10 L9.5 14.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M5 10 H13.6 A4.6 4.6 0 0 1 13.6 19.2 H10.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

/** Compartir: caja con flecha hacia arriba. */
export function ShareIcon({ size = 22, color, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 15.2 V4.4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
      <Path
        d="M8.2 8.2 L12 4.4 L15.8 8.2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M8 11.6 H6.6 A1.6 1.6 0 0 0 5 13.2 V18.8 A1.6 1.6 0 0 0 6.6 20.4 H17.4 A1.6 1.6 0 0 0 19 18.8 V13.2 A1.6 1.6 0 0 0 17.4 11.6 H16"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

/** Sol: clima despejado o cálido. */
export function SunIcon({ size = 22, color, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={4.3} stroke={color} strokeWidth={strokeWidth} fill="none" />
      <Path
        d="M12 2.6 V4.8 M12 19.2 V21.4 M2.6 12 H4.8 M19.2 12 H21.4 M5.4 5.4 L6.9 6.9 M17.1 17.1 L18.6 18.6 M18.6 5.4 L17.1 6.9 M6.9 17.1 L5.4 18.6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

/** Nube con sol: clima fresco o nublado. */
export function CloudSunIcon({ size = 22, color, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M7.4 5.2 a3.4 3.4 0 0 1 4.1 2.1"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M4.6 7.3 V5.4 M6.4 9.9 H8.3 M4.9 4.6 L6.3 6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
        opacity={0.7}
      />
      <Path
        d="M8.2 19.4 H16.6 A3.2 3.2 0 0 0 16.6 13 A4.6 4.6 0 0 0 7.9 14.1 A2.7 2.7 0 0 0 8.2 19.4 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

/** Copo de nieve: frío. */
export function SnowIcon({ size = 22, color, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 3.4 V20.6 M4.3 7.7 L19.7 16.3 M19.7 7.7 L4.3 16.3"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M12 6.4 L9.9 4.4 M12 6.4 L14.1 4.4 M12 17.6 L9.9 19.6 M12 17.6 L14.1 19.6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

/** Chevron hacia la derecha (opciones y enlaces). */
export function ChevronRightIcon({ size = 22, color, strokeWidth = 2.2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M9.6 5.6 L16 12 L9.6 18.4"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

/** Destello de cuatro puntas (momento del giro, modo caos). */
export function SparkIcon({ size = 22, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 3.2 C12.9 8 14.8 9.9 19.6 10.8 C14.8 11.7 12.9 13.6 12 18.4 C11.1 13.6 9.2 11.7 4.4 10.8 C9.2 9.9 11.1 8 12 3.2 Z"
        fill={color}
      />
      <Path d="M18.4 16.2 C18.7 17.9 19.4 18.6 21.1 18.9 C19.4 19.2 18.7 19.9 18.4 21.6 C18.1 19.9 17.4 19.2 15.7 18.9 C17.4 18.6 18.1 17.9 18.4 16.2 Z" fill={color} opacity={0.55} />
    </Svg>
  );
}

/** Mantel de tragamonedas: tres rodillos y palanca (botón GIRAR). */
export function SlotMachineIcon({ size = 22, color, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={3.2} y={6.8} width={14.2} height={11.6} rx={3} stroke={color} strokeWidth={strokeWidth} fill="none" />
      <Path
        d="M7.9 8.6 V16.6 M12.7 8.6 V16.6"
        stroke={color}
        strokeWidth={strokeWidth - 0.4}
        strokeLinecap="round"
        fill="none"
        opacity={0.75}
      />
      <Path d="M20.4 6.6 V14.6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
      <Circle cx={20.4} cy={5.6} r={1.3} fill={color} />
    </Svg>
  );
}

/** Candado cerrado: aviso del primer giro. */
export function LockIcon({ size = 22, color, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M8 10 L8 7.5 A4 4 0 0 1 16 7.5 L16 10"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
      />
      <Rect x={6.5} y={10} width={11} height={9} rx={2.6} fill={color} />
    </Svg>
  );
}

/** Marcador de "sin resultados" o armario vacío. */
export function DottedBoxIcon({ size = 22, color, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect
        x={4}
        y={4}
        width={16}
        height={16}
        rx={4}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray="3.4 3.4"
        strokeLinecap="round"
        fill="none"
      />
      <Path d="M12 9 V15 M9 12 H15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" opacity={0.8} />
    </Svg>
  );
}

/** Birrete / Libro para ocasión clases. */
export function GraduationCapIcon({ size = 20, color, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M2.5 9.5 L12 4.5 L21.5 9.5 L12 14.5 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M6 11.5 V16.5 C6 18.5 8.7 20 12 20 C15.3 20 18 18.5 18 16.5 V11.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
      <Path d="M21.5 9.5 V15.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

/** Taza de café para ocasión cita. */
export function CoffeeIcon({ size = 20, color, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M17 8h1a4 4 0 0 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path d="M6 2v3M10 2v3M14 2v3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

/** Luna para ocasión fiesta/noche. */
export function MoonIcon({ size = 20, color, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

/** Pesa para ocasión deporte/gym. */
export function DumbbellIcon({ size = 20, color, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M6.5 6.5l11 11M3.5 9.5l3-3M17.5 20.5l3-3M2 13l3.5-3.5M14.5 22l3.5-3.5M8.5 4l3.5-3.5M20 7.5l-3.5 3.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

/** Corazón contorno (favoritos / guardar). */
export function HeartIcon({ size = 20, color, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

/** Corazón relleno (favorito activo). */
export function HeartFilledIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572"
        fill={color}
        stroke={color}
        strokeWidth={1}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Filtros / Sliders de búsqueda. */
export function SlidersIcon({ size = 20, color, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

/** Bolsa de compras / Armario. */
export function BagIcon({ size = 20, color, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M3 6h18M16 10a4 4 0 0 1-8 0" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

/** Flecha derecha para botones "Continuar" / "Comenzar". */
export function ArrowRightIcon({ size = 20, color, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M5 12h14M12 5l7 7-7 7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

