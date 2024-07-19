import { notFound } from 'next/navigation';


async function getData(params) {
  const { slug } = params;
  console.log('slug', slug);
  let pageName = 'home';
  if (slug && slug.length) {
    pageName = slug.at(-1);
  }
  const res = await fetch(`http://localhost:3000/api/page-data/${pageName}`);
  console.log('res==>',res)
  const pageData = await res.json();
  console.log('pageData', pageData);
  return {
    ...pageData,
  };
}

export default async function Page(props) {
  const { params } = props;

  const data = await getData({ ...params });
  console.log('standard:page:props', data);
  if (data.error) {
    notFound();
  }
  return (
    <>
      {data.components.map(item => {
        return (
            <div key={item.id}>
              {item.text}
            </div>
        )
      })}
    </>
  );
}

export async function generateMetadata({ params, searchParams }, parent) {
  const data = await getData(params);
  return {
    ...data.metaData,
  };
}
