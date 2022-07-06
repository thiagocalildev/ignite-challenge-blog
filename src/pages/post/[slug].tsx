import { GetStaticPaths, GetStaticProps } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { getPrismicClient } from '../../services/prismic';
import styles from './post.module.scss';
import { CountStringWords } from '../../helpers/countWords';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  const wordCount = post.data.content.reduce(function summarize(sum, content) {
    const headingSum = CountStringWords(content.heading);
    let bodySum = 0;

    content.body.forEach(p => {
      bodySum += CountStringWords(p.text);
    });

    const updatedSum = sum + headingSum + bodySum;

    return updatedSum;
  }, 0);

  const readingTime = `${Math.ceil(wordCount / 200)} min`;

  return (
    <>
      <div className={styles.bannerContainer}>
        <Image src={post.data.banner.url} layout="fill" objectFit="fill" />
      </div>
      <main className={styles.postContainer}>
        <h1>{post.data.title}</h1>
        <div className={styles.items}>
          <FiCalendar />
          <span>
            {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
              locale: ptBR,
            })}
          </span>
          <FiUser />
          <span>{post.data.author}</span>
          <FiClock />
          {/* TODO */}
          <span>{readingTime}</span>
        </div>
        <div className={styles.postContent}>
          {post.data.content.map(content => (
            <div key={content.heading}>
              <h2>{content.heading}</h2>
              <div
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(
                    content.body.map(b => {
                      return b;
                    })
                  ),
                }}
              />
            </div>
          ))}
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts', {
    pageSize: 2,
  });

  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(params.slug));

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: content.body,
        };
      }),
    },
  };

  return {
    props: {
      post,
    },
    revalidate: 60 * 60 * 12, // 12 hours
  };
};
