/**
 * Circular instructor avatar: headshot when we have one, initials when we
 * don't. The container class supplies the size/shape (`hp-ri-thumb`,
 * `hp-detail-instructor-photo`); the image fills it via globals.css.
 */
export default function Avatar({
  photo,
  initials,
  className,
}: {
  photo?: string;
  initials: string;
  className?: string;
}) {
  return (
    <span className={className}>
      {photo ? (
        /* Deliberate <img>: a 54–64px CDN-served avatar gains nothing from
           next/image, which would add an optimizer hop and per-transform cost. */
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="" loading="lazy" decoding="async" />
      ) : (
        initials
      )}
    </span>
  );
}
