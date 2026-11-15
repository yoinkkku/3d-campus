import { LibraryInterior } from "./LibraryInterior";
import { LectureHallInterior } from "./LectureHallInterior";
import { ScienceLabInterior } from "./ScienceLabInterior";
import { CafeteriaInterior } from "./CafeteriaInterior";
import type { InteriorId } from "../types";

export function Interior({ id, isNight }: { id: InteriorId; isNight: boolean }) {
  switch (id) {
    case "library":
      return <LibraryInterior isNight={isNight} />;
    case "lecture-hall":
      return <LectureHallInterior isNight={isNight} />;
    case "science-lab":
      return <ScienceLabInterior isNight={isNight} />;
    case "cafeteria":
      return <CafeteriaInterior isNight={isNight} />;
  }
}
